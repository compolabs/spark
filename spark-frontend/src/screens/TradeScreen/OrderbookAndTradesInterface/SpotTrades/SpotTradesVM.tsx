import React, { PropsWithChildren, useMemo } from "react";
import { makeAutoObservable } from "mobx";

import useVM from "@src/hooks/useVM";
import { fetchTrades, TSpotMarketTrade } from "@src/services/SpotMarketService";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<SpotTradesVM | null>(null);

export const SpotTradesVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const rootStore = useStores();
	const store = useMemo(() => new SpotTradesVM(rootStore), [rootStore]);
	return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSpotTradesVM = () => useVM(ctx);

class SpotTradesVM {
	public trades: Array<TSpotMarketTrade> = [];

	constructor(private rootStore: RootStore) {
		makeAutoObservable(this);
		this.updateTrades().then();
		// todo reaction(() => this.rootStore.tradeStore.marketSymbol, this.updateTrades);
		setInterval(this.updateTrades, 10000); // обновление каждые 10 секунд
	}

	public setTrades = (v: Array<TSpotMarketTrade>) => (this.trades = v);

	updateTrades = async () => {
		const market = this.rootStore.tradeStore.market;
		if (!this.rootStore.initialized || !market) return;
		const data = await fetchTrades(market.baseToken.assetId, 40);
		this.setTrades(data);
	};
}
