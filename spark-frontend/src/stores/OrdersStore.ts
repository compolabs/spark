import RootStore from "@stores/RootStore";
import {makeAutoObservable, reaction} from "mobx";
import {getOrderbook, Order} from "@src/services/OrdersService";

class OrdersStore {
    public readonly rootStore: RootStore;
    orderbook: { buy: Order[]; sell: Order[] } = {buy: [], sell: []};
    private setOrderbook = (orderbook: { buy: Order[]; sell: Order[] }) =>
        (this.orderbook = orderbook);
    myOrders: Order[] = [];
    setMyOrders = (myOrders: Order[]) => (this.myOrders = myOrders);

    initialized: boolean = false;
    private setInitialized = (l: boolean) => (this.initialized = l);

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);
        this.sync().then(() => this.setInitialized(true));
        setInterval(this.sync, 5000);
        reaction(() => this.rootStore.accountStore.address, this.sync);
    }

    sync = () =>
        getOrderbook(this.rootStore.accountStore.addressB256 ?? "", "UNI/USDC").then(
            (res) => {
                this.setOrderbook(res.orderbook);
                this.setMyOrders(res.myOrders);
            }
        ).catch(console.error);
}

export default OrdersStore;
