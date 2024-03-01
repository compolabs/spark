import { Fuel } from "fuels";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { BlockchainNetwork, EVMNetwork, FuelNetwork } from "@src/blockchain";

import RootStore from "./RootStore";

export enum LOGIN_TYPE {
  METAMASK = "metamask",
  FUEL_WALLET = "fuel_wallet",
  GENERATE_SEED = "generate_seed",
}

export enum WALLET_TYPE {
  EVM,
  FUEL,
}

export interface ISerializedAccountStore {
  address: Nullable<string>;
  loginType: Nullable<LOGIN_TYPE>;
  privateKey: Nullable<string>;
}

class AccountStore {
  blockchain: Nullable<BlockchainNetwork> = null;

  initialized = false;

  constructor(
    private rootStore: RootStore,
    initState?: ISerializedAccountStore,
  ) {
    makeAutoObservable(this);

    if (initState) {
      // this.loginType = initState.loginType;
      // this.address = initState.address;
      // this.privateKey = initState.privateKey;
      // if (this.privateKey?.length) {
      //   this.connectWalletByPrivateKey(this.privateKey);
      // } else {
      //   this.address && this.connectWallet(WALLET_TYPE.EVM);
      // }
    }

    this.init();
  }

  init = async () => {
    this.initialized = true;
  };

  private defineBlockchain = (walletType: WALLET_TYPE) => {
    console.log(new Fuel());
    console.log(walletType);
    if (walletType === WALLET_TYPE.EVM) {
      this.blockchain = new EVMNetwork();
      return;
    } else if (walletType === WALLET_TYPE.FUEL) {
      this.blockchain = new FuelNetwork();
      return;
    }

    throw new Error("Unsupported wallet type");
  };

  connectWallet = async (walletType: WALLET_TYPE) => {
    const { notificationStore } = this.rootStore;

    this.defineBlockchain(walletType);

    try {
      await this.blockchain?.connectWallet();
    } catch (error: any) {
      console.error("Error connecting to wallet:", error);

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

      this.blockchain?.disconnectWallet();
    }
  };

  connectWalletByPrivateKey = async (privateKey: string) => {
    const { notificationStore } = this.rootStore;

    try {
      await this.blockchain?.connectWalletByPrivateKey(privateKey);
    } catch (error: any) {
      notificationStore.toast("Unexpected error. Please try again.", { type: "error" });
    }
  };

  addAsset = async (assetId: string) => {
    const { notificationStore } = this.rootStore;

    try {
      await (this.blockchain as EVMNetwork).addAssetToWallet(assetId);
    } catch (error: any) {
      notificationStore.toast(error, { type: "error" });
    }
  };

  disconnect = () => {
    this.blockchain?.disconnectWallet();
  };

  get address() {
    return this.blockchain?.getAddress();
  }

  get isConnected() {
    return !!this.address;
  }

  // ABSTRACT TODO: Fix it
  // serialize = (): ISerializedAccountStore => ({
  //   address: this.address,
  //   loginType: this.loginType,
  //   privateKey: this.privateKey,
  // });
}

export default AccountStore;
