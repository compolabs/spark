import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { NETWORK_ERROR, NetworkError } from "./NetworkError";
import { NETWORK } from "./types";
import { BlockchainNetwork, EVMNetwork, FuelNetwork } from ".";

export class BlockchainNetworkFactory {
  private static instance: Nullable<BlockchainNetworkFactory> = null;
  private instances: Map<string, BlockchainNetwork> = new Map();
  private _currentInstance: Nullable<BlockchainNetwork> = new EVMNetwork();

  private constructor() {
    makeAutoObservable(this);
  }

  public static getInstance(): BlockchainNetworkFactory {
    if (!BlockchainNetworkFactory.instance) {
      BlockchainNetworkFactory.instance = new BlockchainNetworkFactory();
    }
    return BlockchainNetworkFactory.instance;
  }

  getNetworkInstance(type: NETWORK): BlockchainNetwork {
    if (!this.instances.has(type)) {
      switch (type) {
        case NETWORK.EVM:
          this.instances.set(NETWORK.EVM, new EVMNetwork());
          break;
        case NETWORK.FUEL:
          this.instances.set(NETWORK.FUEL, new FuelNetwork());
          break;
        default:
          throw new NetworkError(NETWORK_ERROR.UNKNOWN_NETWORK_TYPE);
      }
    }
    return this.instances.get(type)!;
  }

  get currentInstance(): BlockchainNetwork | null {
    return this._currentInstance;
  }

  set currentInstance(instance: BlockchainNetwork | null) {
    this._currentInstance = instance;
  }

  switchCurrentInstance(type: NETWORK): void {
    const instance = this.getNetworkInstance(type);
    this.currentInstance = instance;
  }
}
