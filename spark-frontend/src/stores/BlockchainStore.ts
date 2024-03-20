import { makeAutoObservable } from "mobx";

import { BlockchainNetworkFactory } from "@src/blockchain/BlockchainNetworkFactory";
import { NETWORK } from "@src/blockchain/types";
import RootStore from "@stores/RootStore";

export interface ISerializedBlockchainStore {
  network?: NETWORK;
}

class BlockchainStore {
  public rootStore: RootStore;

  factory: BlockchainNetworkFactory = BlockchainNetworkFactory.getInstance();

  constructor(rootStore: RootStore, initState?: ISerializedBlockchainStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    if (initState) {
      if (initState.network) {
        this.connectTo(initState.network);
      }
    }
  }

  get currentInstance() {
    return this.factory.currentInstance;
  }

  connectTo = (type: NETWORK) => {
    this.factory.switchCurrentInstance(type);
    return this.factory.currentInstance!;
  };

  serialize = (): ISerializedBlockchainStore => {
    return {
      network: this.currentInstance?.NETWORK_TYPE,
    };
  };
}

export default BlockchainStore;
