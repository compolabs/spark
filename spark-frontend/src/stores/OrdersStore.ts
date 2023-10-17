import RootStore from "@stores/RootStore";
import { makeAutoObservable, reaction } from "mobx";
import { getOrderbook, Order } from "@src/services/OrdersService";
import BN from "@src/utils/BN";

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
		this.sync().then(() => this.setInitialized(true));
		setInterval(this.sync, 5000);
		reaction(() => this.rootStore.accountStore.address, this.sync);
	}

	sync = () =>
		getOrderbook(this.rootStore.accountStore.addressB256 ?? "", "UNI/USDC")
			.then((res) => {
				this.setOrderbook(res.orderbook);
				this.setMyOrders(res.myOrders);
			})
			.catch(console.error);

	get spreadPercent(): string {
		const minBuyPriceOrder = this.orderbook.buy.reduce((acc, val) => (acc.price < val.price ? acc : val));
		const minSellPriceOrder = this.orderbook.sell.reduce((acc, val) => (acc.price < val.price ? acc : val));
		//(Ask Price – Bid Price) ÷ Ask Price
		return new BN(minBuyPriceOrder.price).minus(minSellPriceOrder.price).div(minBuyPriceOrder.price).toFixed(2);
	}

	get spreadPrice(): string {
		const minBuyPriceOrder = this.orderbook.buy.reduce((acc, val) => (acc.price < val.price ? acc : val));
		const minSellPriceOrder = this.orderbook.sell.reduce((acc, val) => (acc.price < val.price ? acc : val));
		return new BN(minBuyPriceOrder.price).minus(minSellPriceOrder.price).toFixed(2);
	}
}

export default OrdersStore;
