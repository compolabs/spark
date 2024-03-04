import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { NETWORK } from "@src/blockchain/types";

import RootStore from "./RootStore";

export enum LOGIN_TYPE {
  METAMASK = "metamask",
  FUEL_WALLET = "fuel_wallet",
  GENERATE_SEED = "generate_seed",
}

export interface ISerializedAccountStore {
  address: Nullable<string>;
  network: Nullable<NETWORK>;
  privateKey: Nullable<string>;
}

class AccountStore {
  initialized = false;

  constructor(
    private rootStore: RootStore,
    initState?: ISerializedAccountStore,
  ) {
    makeAutoObservable(this);

    console.log(initState);
    if (initState) {
      if (initState.privateKey?.length) {
        this.connectWalletByPrivateKey(initState.privateKey);
      } else {
        initState.address && initState.network && this.connectWallet(initState.network);
      }
    }

    this.init();
  }

  init = async () => {
    this.initialized = true;
  };

  connectWallet = async (network: NETWORK) => {
    const { blockchainStore, notificationStore } = this.rootStore;

    const bcNetwork = blockchainStore.connectTo(network);

    try {
      await bcNetwork?.connectWallet();
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

      bcNetwork?.disconnectWallet();
    }
  };

  connectWalletByPrivateKey = async (privateKey: string) => {
    const { notificationStore, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    try {
      await bcNetwork?.connectWalletByPrivateKey(privateKey);
    } catch (error: any) {
      notificationStore.toast("Unexpected error. Please try again.", { type: "error" });
    }
  };

  addAsset = async (assetId: string) => {
    const { notificationStore, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    try {
      await bcNetwork!.addAssetToWallet(assetId);
    } catch (error: any) {
      notificationStore.toast(error, { type: "error" });
    }
  };

  disconnect = () => {
    const { blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    bcNetwork?.disconnectWallet();
  };

  get address() {
    const { blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    return bcNetwork?.getAddress();
  }

  get isConnected() {
    return !!this.address;
  }

  serialize = (): ISerializedAccountStore => {
    const { blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    return {
      address: bcNetwork?.getAddress() ?? null,
      privateKey: bcNetwork?.getPrivateKey() ?? null,
      network: bcNetwork?.NETWORK_TYPE ?? null,
    };
  };
}

export default AccountStore;
