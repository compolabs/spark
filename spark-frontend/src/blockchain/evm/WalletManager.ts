import { ethers, JsonRpcSigner, NonceManager } from "ethers";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { Network, PROVIDERS, TOKENS_BY_ASSET_ID, web3Modal } from "./constants";

export class WalletManager {
  public address: Nullable<string> = null;
  public signer: Nullable<ethers.JsonRpcSigner> = null;
  public privateKey: Nullable<string> = null;

  constructor() {
    makeAutoObservable(this);

    web3Modal.subscribeEvents((event) => console.log(event.data));
  }

  connect = async (targetNetwork: Network): Promise<void> => {
    const walletProvider = web3Modal.getWalletProvider();

    if (!walletProvider) {
      throw new Error("Wallet not connected");
    }

    this.signer = await new ethers.BrowserProvider(walletProvider).getSigner();
    const address = await this.signer.getAddress();

    this.address = address;
  };

  connectByPrivateKey = async (privateKey: string, network: Network): Promise<void> => {
    const wallet = new ethers.Wallet(privateKey, PROVIDERS[network.chainId]);
    const address = await wallet.getAddress();
    this.signer = new NonceManager(wallet) as any as JsonRpcSigner;
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

    await window.ethereum?.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: assetId,
        },
      },
    });
  };

  disconnect = async () => {
    await web3Modal.disconnect();

    this.address = null;
    this.signer = null;
    this.privateKey = null;
  };
}
