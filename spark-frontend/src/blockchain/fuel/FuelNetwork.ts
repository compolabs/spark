import { Provider } from "fuels";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import { Token } from "@src/entity";

import { BlockchainNetwork } from "../abstract/BlockchainNetwork";
import { NETWORK } from "../types";

import { Api } from "./Api";
import { NETWORKS, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL, TOKENS_LIST } from "./constants";
import { WalletManager } from "./WalletManager";

export class FuelNetwork extends BlockchainNetwork {
  NETWORK_TYPE = NETWORK.FUEL;

  private provider: Nullable<Provider> = null;

  private walletManager = new WalletManager();
  private api = new Api();

  public network = NETWORKS[0];

  constructor() {
    super();

    makeObservable(this.walletManager);

    this.initProvider();
  }

  initProvider = async () => {
    this.provider = await Provider.create(NETWORKS[0].url);
  };

  getAddress = (): Nullable<string> => {
    return this.walletManager.address;
  };

  getPrivateKey(): Nullable<string> {
    return this.walletManager.privateKey;
  }

  getBalance = async (accountAddress: string, assetAddress: string): Promise<string> => {
    return this.walletManager.getBalance(accountAddress, assetAddress);
  };

  getTokenList = (): Token[] => {
    return TOKENS_LIST;
  };

  getTokenBySymbol = (symbol: string): Token => {
    return TOKENS_BY_SYMBOL[symbol];
  };

  getTokenByAssetId = (assetId: string): Token => {
    return TOKENS_BY_ASSET_ID[assetId.toLowerCase()];
  };

  connectWallet = async (): Promise<void> => {
    await this.walletManager.connect();
  };

  connectWalletByPrivateKey = async (privateKey: string): Promise<void> => {
    if (!this.provider) {
      throw new Error("Provider does not exist");
    }

    await this.walletManager.connectByPrivateKey(privateKey, this.provider);
  };

  disconnectWallet = (): void => {
    this.walletManager.disconnect();
  };

  addAssetToWallet = async (assetId: string): Promise<void> => {
    await this.walletManager.addAsset(assetId);
  };

  createOrder = async (assetAddress: string, size: string, price: string): Promise<string> => {
    // 0x42d0d50ee2a447bb63fe4e43eb06d38d742377ba 1000000 66825955050000
    if (!this.walletManager.wallet) {
      throw new Error("Wallet does not exist");
    }

    return this.api.createOrder(assetAddress, size, price, this.walletManager.wallet);

    // Uncaught RequireRevertError: The script reverted with reason RequireFailed
    // at revertErrorFactory (revert-error.ts:173:1)
    // at RevertErrorCodes.getError (revert-error-codes.ts:41:1)
    // at RevertErrorCodes.assert (revert-error-codes.ts:22:1)
    // at new ScriptResultDecoderError (errors.ts:34:1)
    // at decodeCallResult (script-request.ts:119:1)
    // at decodeContractCallScriptResult (contract-call-script.ts:174:1)
    // at FunctionInvocationResult.getDecodedValue (invocation-results.ts:89:1)
    // at new InvocationResult (invocation-results.ts:59:1)
    // at new FunctionInvocationResult (invocation-results.ts:151:1)
    // at FunctionInvocationResult.build (invocation-results.ts:175:1)
  };

  cancelOrder = async (orderId: string): Promise<void> => {
    if (!this.walletManager.wallet) {
      throw new Error("Wallet does not exist");
    }

    await this.api.cancelOrder(orderId, this.walletManager.wallet);
  };

  mintToken = async (assetAddress: string): Promise<void> => {
    if (!this.walletManager.wallet) {
      throw new Error("Wallet does not exist");
    }

    await this.api.mintToken(assetAddress, this.walletManager.wallet);
  };

  approve = async (assetAddress: string, amount: string): Promise<void> => {};

  allowance = async (assetAddress: string): Promise<string> => {
    return "";
  };
}
