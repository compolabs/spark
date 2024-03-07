import { CoinQuantityLike, hashMessage, WalletLocked, WalletUnlocked } from "fuels";

import { DEFAULT_DECIMALS } from "@src/constants";
import { FAUCET_AMOUNTS } from "@src/stores/FaucetStore";
import BN from "@src/utils/BN";

import { AssetIdInput, I64Input } from "./types/OrderbookAbi";
import { IdentityInput } from "./types/TokenAbi";
import { CONTRACT_ADDRESSES, TOKENS_BY_ASSET_ID } from "./constants";
import { OrderbookAbi__factory, TokenAbi__factory } from "./types";

export class Api {
  createOrder = async (
    assetAddress: string,
    size: string,
    price: string,
    wallet: WalletLocked | WalletUnlocked,
  ): Promise<string> => {
    const orderbookFactory = OrderbookAbi__factory.connect(CONTRACT_ADDRESSES.spotMarket, wallet);

    const assetId: AssetIdInput = { value: assetAddress };
    const isNegative = size.includes("-");
    const absSize = size.replace("-", "");
    const baseSize: I64Input = { value: absSize, negative: isNegative };

    const amount = new BN(absSize).times(price).div(new BN(10).pow(DEFAULT_DECIMALS + 8 - 6));
    // let quote_size = base_size.abs() as u128 * base_price as u128
    // / 10u128.pow(
    //     self.price_decimals as u32 + market.asset_decimals
    //         - self.quote_token_decimals as u32,
    // );

    const forward: CoinQuantityLike = {
      amount: amount.toString(),
      assetId: "0x0450e4d385cbd2914f74505f18f01587cc4f4ad1fdef4b80cbde2a8155a86d72", // test
    };

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
