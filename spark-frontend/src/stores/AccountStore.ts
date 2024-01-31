import { ethers } from "ethers";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

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

const networks = [
  { name: "Arbitrum Sepolia", rpc: "https://arbitrum-sepolia-rpc.gateway.pokt.network", chainId: "421614" },
];

class AccountStore {
  rootStore: RootStore;
  network = networks[0];
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
    if (!window.ethereum) {
      console.error("Ethereum wallet not found");
      this.rootStore.notificationStore.toast("Ethereum wallet not found", { type: "warning" });
      return;
    }

    try {
      const ethereum = window.ethereum;
      await ethereum.request({ method: "eth_requestAccounts" });
      this.signer = await new ethers.BrowserProvider(ethereum).getSigner();

      const network = await this.signer.provider.getNetwork();
      if (network.chainId.toString() !== this.network.chainId) {
        this.rootStore.notificationStore.toast("Connected to the wrong network", { type: "warning" });
        this.disconnect();
        return;
      }

      this.address = await this.signer.getAddress();
    } catch (error) {
      console.error("Error connecting to wallet:", error);
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
