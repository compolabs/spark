import { Fuel, FuelWalletConnector, FuelWalletLocked } from "@fuel-wallet/sdk";
import { Provider, Wallet } from "fuels";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { TOKENS_BY_ASSET_ID } from "./constants";

export class WalletManager {
  public address: Nullable<string> = null;
  public wallet: Nullable<FuelWalletLocked> = null;
  public privateKey: Nullable<string> = null;

  private fuel = new Fuel({
    connectors: [new FuelWalletConnector()],
  });

  constructor() {
    makeAutoObservable(this);
  }

  connect = async (): Promise<void> => {
    const hasConnector = await this.fuel.hasConnector();

    if (!hasConnector) {
      throw new Error("Fuel wallet not found");
    }
    const isApproved = await this.fuel.connect();

    if (!isApproved) {
      return;
    }

    const account = await this.fuel.currentAccount();

    if (!account) {
      throw new Error("Account is not connected!");
    }

    this.wallet = await this.fuel.getWallet(account);
    this.address = account;
  };

  connectByPrivateKey = async (privateKey: string, provider: Provider): Promise<void> => {
    const wallet = Wallet.fromPrivateKey(privateKey, provider);

    const address = wallet.address.toString();
    this.address = address;
    this.privateKey = privateKey;
  };

  addAsset = async (assetId: string) => {
    // Не добавляем, если авторизированы по приватному ключу
    if (this.privateKey?.length) {
      return;
    }

    if (!this.address) {
      throw new Error("Not connected to a wallet.");
    }

    const token = TOKENS_BY_ASSET_ID[assetId];

    if (!token) {
      throw new Error("Invalid token.");
    }

    const fuelNetwork = {
      type: "fuel",
      chainId: 0, // TODO: ???
      decimals: token.decimals,
      assetId: token.assetId,
      contractId: "string", // TODO: ???
    } as const;

    const asset = {
      name: token.name,
      symbol: token.symbol,
      icon: token.logo,
      networks: [fuelNetwork],
    };

    await this.fuel.addAsset(asset);
  };

  getBalance = async (address: string, assetId: string) => {
    if (!this.wallet) {
      throw new Error("Wallet does not exist");
    }

    const balance = await this.wallet.getBalance(assetId);
    return balance.toString();
  };

  disconnect = () => {
    this.address = null;
    this.privateKey = null;

    void this.fuel.disconnect();
  };
}
