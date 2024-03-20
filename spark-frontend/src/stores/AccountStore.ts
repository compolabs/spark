import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { NETWORK_ERROR, NetworkError } from "@src/blockchain/NetworkError";
import { NETWORK } from "@src/blockchain/types";

import RootStore from "./RootStore";

export interface ISerializedAccountStore {
  privateKey: Nullable<string>;
  address: Nullable<string>;
}

class AccountStore {
  initialized = false;

  constructor(
    private rootStore: RootStore,
    initState?: ISerializedAccountStore,
  ) {
    makeAutoObservable(this);

    const { blockchainStore } = this.rootStore;

    if (initState) {
      if (initState.privateKey) {
        this.connectWalletByPrivateKey(initState.privateKey);
      } else if (initState.address && blockchainStore.currentInstance?.NETWORK_TYPE) {
        this.connectWallet(blockchainStore.currentInstance.NETWORK_TYPE);
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

      if (error instanceof NetworkError) {
        if (error.code === NETWORK_ERROR.UNKNOWN_ACCOUNT) {
          notificationStore.toast("Please authorize the wallet account when connecting.", { type: "info" });
          return;
        }
      }

      notificationStore.toast("Unexpected error. Please try again.", { type: "error" });

      try {
        bcNetwork?.disconnectWallet();
      } catch {
        /* empty */
      }
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
      privateKey: bcNetwork?.getPrivateKey() ?? null,
      address: bcNetwork?.getAddress() ?? null,
    };
  };
}

export default AccountStore;
