import RootStore from "@stores/RootStore";
import { makeAutoObservable, reaction } from "mobx";
import {
  getActiveOrders,
  getOrdersByOwner,
  Order,
} from "@src/services/OrdersService";

class OrdersStore {
  public readonly rootStore: RootStore;
  activeOrders: Order[] = [];
  private setActiveOrders = (activeOrders: Order[]) =>
    (this.activeOrders = activeOrders);
  myOrders: Order[] = [];
  setMyOrders = (myOrders: Order[]) => (this.myOrders = myOrders);

  initialized: boolean = false;
  private setInitialized = (l: boolean) => (this.initialized = l);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.sync().then(() => this.setInitialized(true));
    setInterval(this.sync, 10000);
    reaction(() => this.rootStore.accountStore.address, this.sync);
  }

  sync = () => Promise.all([this.updateActiveOrders(), this.updateMyOrders()]);
  updateActiveOrders = async () => getActiveOrders().then(this.setActiveOrders);
  updateMyOrders = async () => {
    const wallet = this.rootStore.accountStore.ethFormatWallet;
    if (wallet != null) getOrdersByOwner(wallet).then(this.setMyOrders);
  };
}

export default OrdersStore;
