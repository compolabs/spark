import { ethers } from "ethers";
import { makeAutoObservable, runInAction } from "mobx";
import { Nullable } from "tsdef";

import { NETWORKS, TOKENS_BY_ASSET_ID } from "@src/constants";

import RootStore from "./RootStore";

export enum LOGIN_TYPE {
  METAMASK = "metamask",
  FUEL_WALLET = "fuel_wallet",
  GENERATE_SEED = "generate_seed",
}

export interface ISerializedAccountStore {
  address: Nullable<string>;
  loginType: Nullable<LOGIN_TYPE>;
  mnemonic: Nullable<string>;
}

class AccountStore {
  network = NETWORKS[0];
  signer: Nullable<ethers.JsonRpcSigner> = null;
  loginType: Nullable<LOGIN_TYPE> = null;
  address: Nullable<string> = null;
  mnemonic: Nullable<string> = null;

  initialized: boolean = false;

  constructor(
    private rootStore: RootStore,
    initState?: ISerializedAccountStore,
  ) {
    makeAutoObservable(this);

    if (initState) {
      this.loginType = initState.loginType;
      this.address = initState.address;
      this.mnemonic = initState.mnemonic;
      this.address && this.connectWallet();
    }

    this.init();
  }

  init = async () => {
    this.initialized = true;
  };

  connectWallet = async () => {
    const { notificationStore } = this.rootStore;
    if (!window.ethereum) {
      console.error("Ethereum wallet not found");
      notificationStore.toast("Ethereum wallet not found", { type: "error" });
      return;
    }

    try {
      const ethereum = window.ethereum;
      this.signer = await new ethers.BrowserProvider(ethereum).getSigner();
      const network = await this.signer.provider.getNetwork();
      const targetChainId = parseInt(this.network.chainId, 10).toString(16);
      const currentChainId = parseInt(network.chainId.toString(), 10).toString(16);

      if (currentChainId !== targetChainId) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${targetChainId}`,
              chainName: this.network.name,
              rpcUrls: [this.network.rpc],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } else {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId}` }],
        });
      }
      const address = await this.signer.getAddress();
      runInAction(() => {
        this.address = address;
      });
    } catch (error: any) {
      console.error("Error connecting to wallet:", error);
      if (notificationStore) {
        if (typeof error === "object" && error.message && typeof error.message === "string") {
          if (error.message.includes("wallet_addEthereumChain")) {
            notificationStore.toast("Error adding Arbitrum Sepolia", { type: "error" });
          } else if (error.message.includes("wallet_switchEthereumChain")) {
            notificationStore.toast("Failed to switch to the Arbitrum Sepolia", { type: "error" });
          } else {
            notificationStore.toast("Unexpected error. Please try again.", { type: "error" });
          }
        } else {
          notificationStore.toast("Unexpected error. Please try again.", { type: "error" });
        }
      }
      this.disconnect();
    }
  };

  addAsset = async (assetId: string) => {
    const { accountStore, notificationStore } = this.rootStore;

    if (!accountStore.isConnected || !accountStore.address) {
      console.warn("Not connected to a wallet.");
      notificationStore.toast("Not connected to a wallet.", { type: "error" });
      return;
    }

    const token = TOKENS_BY_ASSET_ID[assetId];

    if (!token) {
      console.warn("Invalid token.");
      notificationStore.toast("Invalid token.", { type: "error" });
      return;
    }

    try {
      await window.ethereum?.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: assetId,
          },
        },
      });
    } catch (error) {
      notificationStore.toast("Balance updated", { type: "success" });
    }
  };

  disconnect = () => {
    this.address = null;
    this.signer = null;
    this.loginType = null;
    this.mnemonic = null;
  };

  getAddress = () => {
    return this.address;
  };

  get isConnected() {
    return !!this.address;
  }

  serialize = (): ISerializedAccountStore => ({
    address: this.address,
    loginType: this.loginType,
    mnemonic: this.mnemonic,
  });
}

export default AccountStore;
