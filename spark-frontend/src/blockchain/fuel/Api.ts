import { CoinQuantityLike, hashMessage, WalletLocked, WalletUnlocked } from "fuels";

import { DEFAULT_DECIMALS } from "@src/constants";
import { Token } from "@src/entity";
import { FAUCET_AMOUNTS } from "@src/stores/FaucetStore";
import BN from "@src/utils/BN";

import { AssetIdInput, I64Input } from "./types/OrderbookAbi";
import { IdentityInput } from "./types/TokenAbi";
import { CONTRACT_ADDRESSES, TOKENS_BY_ASSET_ID } from "./constants";
import { Fetch } from "./Fetch";
import { OrderbookAbi__factory, TokenAbi__factory } from "./types";

export class Api {
  public fetch = new Fetch();

  createOrder = async (
    baseToken: Token,
    quoteToken: Token,
    size: string,
    price: string,
    wallet: WalletLocked | WalletUnlocked,
  ): Promise<string> => {
    const orderbookFactory = OrderbookAbi__factory.connect(CONTRACT_ADDRESSES.spotMarket, wallet);

    console.log(baseToken, quoteToken, size, price);

    const assetId: AssetIdInput = { value: baseToken.assetId };
    const isNegative = size.includes("-");
    const absSize = size.replace("-", "");
    const baseSize: I64Input = { value: absSize, negative: isNegative };

    const amountToSend = new BN(absSize)
      .times(price)
      .dividedToIntegerBy(new BN(10).pow(DEFAULT_DECIMALS + baseToken.decimals - quoteToken.decimals));

    const forward: CoinQuantityLike = {
      amount: amountToSend.toString(),
      assetId: isNegative ? baseToken.assetId : quoteToken.assetId,
    };

    console.log(assetId, baseSize, price, forward);

    const tx = await orderbookFactory.functions
      .open_order(assetId, baseSize, price)
      .callParams({ forward })
      .txParams({ gasPrice: 1 })
      .call();

    return tx.transactionId;
  };

  cancelOrder = async (orderId: string, wallet: WalletLocked | WalletUnlocked): Promise<void> => {
    const orderbookFactory = OrderbookAbi__factory.connect(CONTRACT_ADDRESSES.spotMarket, wallet);

    await orderbookFactory.functions.cancel_order(orderId).txParams({ gasPrice: 1 }).call();
  };

  mintToken = async (assetAddress: string, wallet: WalletLocked | WalletUnlocked): Promise<void> => {
    const tokenFactory = CONTRACT_ADDRESSES.tokenFactory;
    const tokenFactoryContract = TokenAbi__factory.connect(tokenFactory, wallet);

    const token = TOKENS_BY_ASSET_ID[assetAddress];
    const amount = BN.parseUnits(FAUCET_AMOUNTS[token.symbol].toString(), token.decimals);
    const hash = hashMessage(token.symbol);
    const identity: IdentityInput = {
      Address: {
        value: wallet.address.toB256(),
      },
    };

    await tokenFactoryContract.functions.mint(identity, hash, amount.toString()).txParams({ gasPrice: 1 }).call();
  };

  approve = async (assetAddress: string, amount: string): Promise<void> => {};

  allowance = async (assetAddress: string): Promise<string> => {
    return "";
  };
}
