import React, { PropsWithChildren, useMemo } from "react";
import useVM from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { fetchTrades, TSpotMarketTrade } from "@src/services/SpotMarketService";
import { TOKENS_BY_SYMBOL } from "@src/constants";

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
		//todo вставить baseToken из выбранного маркета в tradeStore
		const data = await fetchTrades(TOKENS_BY_SYMBOL.BTC.assetId, 40);
		this.setTrades(data);
	};
}
