import { toast } from "react-toastify";
import { Fuel, FuelWalletConnector, FuelWalletLocked } from "@fuel-wallet/sdk";
import { Provider, Wallet } from "fuels";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { NETWORK_ERROR, NetworkError } from "../NetworkError";

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

    this.fuel.on(this.fuel.events.currentAccount, this.onCurrentAccountChange);
  }

  connect = async (): Promise<void> => {
    const hasConnector = await this.fuel.hasConnector();

    if (!hasConnector) {
      throw new NetworkError(NETWORK_ERROR.NOT_CONNECTED);
    }
    const isApproved = await this.fuel.connect();

    if (!isApproved) {
      return;
    }

    let account = null;
    try {
      account = await this.fuel.currentAccount();
    } catch (error) {
      console.error("Not authorized");
    }

    if (!account) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_ACCOUNT);
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
      throw new NetworkError(NETWORK_ERROR.NOT_CONNECTED);
    }

    const token = TOKENS_BY_ASSET_ID[assetId];

    if (!token) {
      throw new NetworkError(NETWORK_ERROR.INVALID_TOKEN);
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
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_WALLET);
    }

    const balance = await this.wallet.getBalance(assetId);
    return balance.toString();
  };

  disconnect = () => {
    this.address = null;
    this.privateKey = null;

    void this.fuel.disconnect();
  };

  private onCurrentAccountChange = async (account: Nullable<string>) => {
    if (account === null) {
      try {
        await this.connect();
      } catch (error) {
        if (error instanceof NetworkError) {
          if (error.code === NETWORK_ERROR.UNKNOWN_ACCOUNT) {
            toast("Please authorize the wallet account when connecting.", { type: "info" });
            return;
          }
        }
      }
      return;
    }
    this.address = account;
  };
}
