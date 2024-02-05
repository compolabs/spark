import { ethers } from "ethers";
import { makeAutoObservable, runInAction } from "mobx";
import { Nullable } from "tsdef";

import { TOKENS_BY_ASSET_ID } from "@src/constants";

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

export const networks = [
  // { name: "Arbitrum Sepolia", rpc: "https://arbitrum-sepolia-rpc.gateway.pokt.network", chainId: "421614" },
  {
    name: "Arbitrum Sepolia",
    rpc: "https://arbitrum-sepolia.infura.io/v3/c9c23a966a0e4064b925cb2d6783e679",
    chainId: "421614",
  },
];

class AccountStore {
  rootStore: RootStore;
  network = networks[0]; //todo добавтиь функционал выбора сети
  provider: Nullable<ethers.Provider> = null;
  signer: Nullable<ethers.JsonRpcSigner> = null;
  loginType: Nullable<LOGIN_TYPE> = null;
  address: Nullable<string> = null;
  mnemonic: Nullable<string> = null;

  initialized: boolean = false;

  constructor(rootStore: RootStore, initState?: ISerializedAccountStore) {
    this.rootStore = rootStore;
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
    this.provider = new ethers.JsonRpcProvider(this.network.rpc);
    this.initialized = true;
  };

  connectWallet = async () => {
    const { notificationStore } = this.rootStore;
    if (!window.ethereum) {
      console.error("Ethereum wallet not found");
      return;
    }
    try {
      const ethereum = window.ethereum;
      await ethereum.request({ method: "eth_requestAccounts" });
      this.signer = await new ethers.BrowserProvider(ethereum).getSigner();

      const network = await this.signer.provider.getNetwork();
      const targetChainId = parseInt(networks[0].chainId, 10).toString(16);
      const currentChainId = parseInt(network.chainId.toString(), 10).toString(16);
      if (currentChainId !== targetChainId) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${targetChainId}`,
                chainName: networks[0].name,
                rpcUrls: [networks[0].rpc],
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding Arbitrum Sepolia:", addError);
          notificationStore.toast("Error adding Arbitrum Sepolia", { type: "error" });
          this.disconnect();
          return;
        }
      } else {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${targetChainId}` }],
          });
          notificationStore.toast("Switched to the Arbitrum Sepolia", { type: "success" });
        } catch (switchError) {
          console.error("Error switching to the Arbitrum Sepolia", switchError);
          notificationStore.toast("Failed to switch to the Arbitrum Sepolia", { type: "error" });
          this.disconnect();
          return;
        }
      }

      const address = await this.signer.getAddress();
      runInAction(() => {
        this.address = address;
      });
    } catch (error) {
      console.error("Error connecting to wallet:", error);
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

  isConnected = () => {
    return !!this.address;
  };

  serialize = (): ISerializedAccountStore => ({
    address: this.address,
    loginType: this.loginType,
    mnemonic: this.mnemonic,
  });
}

export default AccountStore;
