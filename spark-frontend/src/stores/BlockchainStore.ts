import { makeAutoObservable } from "mobx";

import { BlockchainNetworkFactory } from "@src/blockchain/BlockchainNetworkFactory";
import { NETWORK } from "@src/blockchain/types";
import RootStore from "@stores/RootStore";

class BlockchainStore {
  public rootStore: RootStore;

  factory: BlockchainNetworkFactory = BlockchainNetworkFactory.getInstance();

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get currentInstance() {
    return this.factory.currentInstance;
  }

  connectTo = (type: NETWORK) => {
    this.factory.switchCurrentInstance(type);
    return this.factory.currentInstance!;
  };
}

export default BlockchainStore;
