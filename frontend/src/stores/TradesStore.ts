import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";

class TradesStore {
  public readonly rootStore: RootStore;
  // activeTrades: Order[] = [];
  // private setActiveTrades = (activeTrades: Order[]) =>
  //   (this.activeTrades = activeTrades);
  // myTrades: Order[] = [];
  // private setMyTrades = (myTrades: Order[]) => (this.myTrades = myTrades);

  initialized: boolean = true;
  private setInitialized = (l: boolean) => (this.initialized = l);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    // this.sync().then(() => this.setInitialized(true));
    // setInterval(this.sync, 10000);
    // reaction(() => this.rootStore.accountStore.address, this.sync);
  }

  // sync = () => Promise.all([this.updateActiveTrades(), this.updateMyTrades()]);
  // updateActiveTrades = async () => getActiveTrades().then(this.setActiveTrades);
}

export default TradesStore;
