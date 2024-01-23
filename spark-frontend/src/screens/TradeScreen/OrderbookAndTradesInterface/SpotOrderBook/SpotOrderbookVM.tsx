import React, { useMemo } from "react";
import _ from "lodash";
import { makeAutoObservable, when } from "mobx";

import useVM from "@src/hooks/useVM";
import { fetchOrders, SpotMarketOrder } from "@src/services/SpotMarketService";
import BN from "@src/utils/BN";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<SpotOrderbookVM | null>(null);

interface IProps {
	children: React.ReactNode;
}

export const SpotOrderbookVMProvider: React.FC<IProps> = ({ children }) => {
	const rootStore = useStores();
	const store = useMemo(() => new SpotOrderbookVM(rootStore), [rootStore]);
	return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSpotOrderbookVM = () => useVM(ctx);

type TOrderbookData = {
	buy: Array<SpotMarketOrder>;
	sell: Array<SpotMarketOrder>;
	spreadPercent: string;
	spreadPrice: string;
};

class SpotOrderbookVM {
	rootStore: RootStore;

	orderbook: TOrderbookData = {
		buy: [],
		sell: [],
		spreadPercent: "0.00",
		spreadPrice: "",
	};
	decimalKey: string = "0";
	orderFilter: number = 0;
	amountOfOrders: number = 0;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
		when(() => this.rootStore.initialized, this.updateOrderBook);
		// todo reaction(() => this.rootStore.tradeStore.marketSymbol, this.updateOrderBook);
		setInterval(this.updateOrderBook, 10000); // обновление каждые 10 секунд
	}

	get oneSizeOrders() {
		return +new BN(this.amountOfOrders).div(2).toFixed(0) - 1;
	}

	get buyOrders() {
		return this.orderbook.buy
			.slice()
			.sort((a, b) => {
				if (a.price === null && b.price === null) return 0;
				if (a.price === null && b.price !== null) return 1;
				if (a.price === null && b.price === null) return -1;
				return a.price < b.price ? 1 : -1;
			})
			.reverse()
			.slice(this.orderFilter === 0 ? -this.oneSizeOrders : -this.amountOfOrders)
			.reverse();
	}

	get sellOrders() {
		return this.orderbook.sell
			.slice()
			.sort((a, b) => {
				if (a.price === null && b.price === null) return 0;
				if (a.price === null && b.price !== null) return 1;
				if (a.price === null && b.price === null) return -1;
				return a.price < b.price ? 1 : -1;
			})
			.slice(this.orderFilter === 0 ? -this.oneSizeOrders : -this.amountOfOrders);
	}

	get totalBuy() {
		return this.buyOrders.reduce((acc, order) => acc.plus(order.quoteSize), BN.ZERO);
	}

	get totalSell() {
		return this.sellOrders.reduce((acc, order) => acc.plus(order.baseSize), BN.ZERO);
	}

	calcSize = () => {
		this.setAmountOfOrders(+new BN(window.innerHeight - 260).div(17).toFixed(0));
	};

	setAmountOfOrders = (value: number) => (this.amountOfOrders = value);

	setDecimalKey = (value: string) => (this.decimalKey = value);

	setOrderFilter = (value: number) => (this.orderFilter = value);

	updateOrderBook = async () => {
		const market = this.rootStore.tradeStore.market;
		if (!this.rootStore.initialized || !market) return;
		const [buy, sell] = await Promise.all([
			fetchOrders({ baseToken: market.baseToken.assetId, type: "BUY", limit: 20 }),
			fetchOrders({ baseToken: market.baseToken.assetId, type: "SELL", limit: 20 }),
		]);
		const maxBuyPriceOrder = _.maxBy(buy, "orderPrice");
		const minSellPriceOrder = _.minBy(sell, "orderPrice");
		/*todo сделать order классом, добавть priceUnits и использоваь тут priceUnits*/
		const spreadPercent =
			maxBuyPriceOrder && minSellPriceOrder
				? new BN(maxBuyPriceOrder.price).minus(minSellPriceOrder.price).div(maxBuyPriceOrder.price).toFixed(2)
				: "0.00";
		const spreadPrice =
			maxBuyPriceOrder && minSellPriceOrder
				? BN.formatUnits(new BN(maxBuyPriceOrder.price).minus(minSellPriceOrder.price), 9).toFixed(2)
				: "";

		this.setOrderbook({ buy, sell, spreadPercent, spreadPrice });
	};

	private setOrderbook = (orderbook: TOrderbookData) => (this.orderbook = orderbook);
}
