import { hashMessage, WalletLocked, WalletUnlocked } from "fuels";

import { FAUCET_AMOUNTS } from "@src/stores/FaucetStore";
import BN from "@src/utils/BN";

import { IdentityInput } from "./types/TokenAbi";
import { CONTRACT_ADDRESSES, TOKENS_BY_ASSET_ID } from "./constants";
import { TokenAbi__factory } from "./types";

export class Api {
  createOrder = async (assetAddress: string, size: string, price: string): Promise<string> => {
    return "";
  };

  cancelOrder = async (orderId: string): Promise<void> => {};

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
    console.log("minting");
    console.log("args", { identity, hash, amount: amount.toString() });
    try {
      await tokenFactoryContract.functions.mint(identity, hash, amount.toString()).txParams({ gasPrice: 1 }).call();
    } catch (error) {
      console.log("wtf", error);
    }
  };

  approve = async (assetAddress: string, amount: string): Promise<void> => {};

  allowance = async (assetAddress: string): Promise<string> => {
    return "";
  };
}
