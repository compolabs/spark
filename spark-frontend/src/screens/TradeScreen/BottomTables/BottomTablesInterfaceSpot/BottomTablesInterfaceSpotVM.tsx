import React, { PropsWithChildren, useMemo } from "react";
import useVM from "@src/hooks/useVM";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import { fetchOrders, SpotMarketOrder } from "@src/services/SpotMarketService";

const ctx = React.createContext<BottomTablesInterfaceSpotVM | null>(null);

export const BottomTablesInterfaceSpotVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const rootStore = useStores();
	const store = useMemo(() => new BottomTablesInterfaceSpotVM(rootStore), [rootStore]);
	return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useBottomTablesInterfaceSpotVM = () => useVM(ctx);

class BottomTablesInterfaceSpotVM {
	myOrders: SpotMarketOrder[] = [];
	initialized: boolean = false;
	private readonly rootStore: RootStore;

	constructor(rootStore: RootStore) {
		makeAutoObservable(this);
		this.rootStore = rootStore;
		when(
			() => this.rootStore.tradeStore.market != null,
			() => this.sync().then(() => this.setInitialized(true)),
		);
		setInterval(this.sync, 10000);
		reaction(() => this.rootStore.accountStore.address, this.sync);
	}

	private sync = async () => {
		const { accountStore, tradeStore } = this.rootStore;
		if (tradeStore.market == null || accountStore.address == null) return;
		return fetchOrders({ baseToken: tradeStore.market.baseToken.assetId, limit: 100, trader: accountStore.address })
			.then(this.setMySpotOrders)
			.catch(console.error);
	};

	private setMySpotOrders = (myOrders: SpotMarketOrder[]) => (this.myOrders = myOrders);

	private setInitialized = (l: boolean) => (this.initialized = l);
}
