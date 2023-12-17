import RootStore from "@stores/RootStore";
import { makeAutoObservable, reaction } from "mobx";
import { getSpotOrderbook, SpotOrder } from "@src/services/SpotMarketService";
import BN from "@src/utils/BN";
import _ from "lodash";

class SpotOrdersStore {
	public readonly rootStore: RootStore;
	orderbook: { buy: SpotOrder[]; sell: SpotOrder[] } = { buy: [], sell: [] };
	private setSpotOrderbook = (orderbook: { buy: SpotOrder[]; sell: SpotOrder[] }) => (this.orderbook = orderbook);
	mySpotOrders: SpotOrder[] = [];
	setMySpotOrders = (mySpotOrders: SpotOrder[]) => (this.mySpotOrders = mySpotOrders);

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
		getSpotOrderbook(this.rootStore.accountStore.addressB256 ?? "", "UNI/USDC")
			.then((res) => {
				this.setSpotOrderbook(res.orderbook);
				this.setMySpotOrders(res.mySpotOrders);
			})
			.catch(console.error);

	get spreadPercent(): string {
		const maxBuyPriceSpotOrder = _.maxBy(this.orderbook.buy, "price");
		const minSellPriceSpotOrder = _.minBy(this.orderbook.sell, "price");
		return maxBuyPriceSpotOrder != null && minSellPriceSpotOrder != null
			? new BN(maxBuyPriceSpotOrder.price).minus(minSellPriceSpotOrder.price).div(maxBuyPriceSpotOrder.price).toFixed(2)
			: "x";
	}

	get spreadPrice(): string {
		const maxBuyPriceSpotOrder = _.maxBy(this.orderbook.buy, "price");
		const minSellPriceSpotOrder = _.minBy(this.orderbook.sell, "price");
		return maxBuyPriceSpotOrder != null && minSellPriceSpotOrder != null
			? new BN(maxBuyPriceSpotOrder.price).minus(minSellPriceSpotOrder.price).toFixed(2)
			: "";
	}
}

export default SpotOrdersStore;
