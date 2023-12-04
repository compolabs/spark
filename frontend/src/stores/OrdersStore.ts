import RootStore from "@stores/RootStore";
import { makeAutoObservable, reaction } from "mobx";
import { getOrderbook, Order } from "@src/services/OrdersService";
import BN from "@src/utils/BN";
import _ from "lodash";

class OrdersStore {
	public readonly rootStore: RootStore;
	orderbook: { buy: Order[]; sell: Order[] } = { buy: [], sell: [] };
	private setOrderbook = (orderbook: { buy: Order[]; sell: Order[] }) => (this.orderbook = orderbook);
	myOrders: Order[] = [];
	setMyOrders = (myOrders: Order[]) => (this.myOrders = myOrders);

	initialized: boolean = false;
	private setInitialized = (l: boolean) => (this.initialized = l);

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
		// this.sync().then(() => this.setInitialized(true));
		// setInterval(this.sync, 5000);
		// reaction(() => this.rootStore.accountStore.address, this.sync);
	}

	sync = () =>
		getOrderbook(this.rootStore.accountStore.addressB256 ?? "", "UNI/USDC")
			.then((res) => {
				this.setOrderbook(res.orderbook);
				this.setMyOrders(res.myOrders);
			})
			.catch(console.error);

	get spreadPercent(): string {
		const maxBuyPriceOrder = _.maxBy(this.orderbook.buy, "price");
		const minSellPriceOrder = _.minBy(this.orderbook.sell, "price");
		return maxBuyPriceOrder != null && minSellPriceOrder != null
			? new BN(maxBuyPriceOrder.price).minus(minSellPriceOrder.price).div(maxBuyPriceOrder.price).toFixed(2)
			: "x";
	}

	get spreadPrice(): string {
		const maxBuyPriceOrder = _.maxBy(this.orderbook.buy, "price");
		const minSellPriceOrder = _.minBy(this.orderbook.sell, "price");
		return maxBuyPriceOrder != null && minSellPriceOrder != null
			? new BN(maxBuyPriceOrder.price).minus(minSellPriceOrder.price).toFixed(2)
			: "";
	}
}

export default OrdersStore;
