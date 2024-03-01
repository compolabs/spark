import { Provider } from "fuels";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import { BlockchainNetwork } from "../abstract/BlockchainNetwork";
import { NETWORK } from "../types";

import { Api } from "./Api";
import { NETWORKS } from "./constants";
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

  getBalance = async (accountAddress: string, assetAddress: string): Promise<string> => {
    return this.walletManager.getBalance(accountAddress, assetAddress);
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
    return "";
  };

  cancelOrder = async (orderId: string): Promise<void> => {};

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
