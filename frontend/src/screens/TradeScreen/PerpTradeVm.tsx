import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";

const ctx = React.createContext<PerpTradeVm | null>(null);

interface IProps {
	children: React.ReactNode;
}

export const PerpTradeVMProvider: React.FC<IProps> = ({ children }) => {
	const rootStore = useStores();
	const store = useMemo(() => new PerpTradeVm(rootStore), [rootStore]);
	return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

type OrderAction = "long" | "short";

export const usePerpTradeVM = () => useVM(ctx);

class PerpTradeVm {
	public rootStore: RootStore;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		this.updateMarket();
		reaction(
			() => [this.rootStore.tradeStore.marketSymbol],
			() => this.updateMarket(),
		);
	}

	updateMarket = () => {
		const market = this.rootStore.tradeStore.market;
		if (market == null || market.type === "spot") return;
		this.setAssetId0(market?.token0.assetId);
		this.setAssetId1(market?.token1.assetId);
	};

	public loading: boolean = false;
	private setLoading = (l: boolean) => (this.loading = l);

	public assetId0: string = TOKENS_BY_SYMBOL.UNI.assetId;
	public setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

	public assetId1: string = TOKENS_BY_SYMBOL.USDC.assetId;
	public setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

	get token0() {
		return TOKENS_BY_ASSET_ID[this.assetId0];
	}

	get token1() {
		return TOKENS_BY_ASSET_ID[this.assetId1];
	}

	longPrice: BN = BN.ZERO;
	setLongPrice = (price: BN, sync?: boolean) => {
		this.longPrice = price;
		if (price.eq(0)) this.setLongTotal(BN.ZERO);
		if (this.longAmount.gt(0) && price.gt(0) && sync) {
			const v1 = BN.formatUnits(price, this.token1.decimals);
			const v2 = BN.formatUnits(this.longAmount, this.token0.decimals);
			this.setLongTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
		}
	};

	longAmount: BN = BN.ZERO;
	setLongAmount = (amount: BN, sync?: boolean) => {
		this.longAmount = amount;
		if (this.longPrice.gt(0) && amount.gt(0) && sync) {
			const v1 = BN.formatUnits(this.longPrice, this.token1.decimals);
			const v2 = BN.formatUnits(amount, this.token0.decimals);
			const total = BN.parseUnits(v2.times(v1), this.token1.decimals);
			this.setLongTotal(total);
			const balance = this.rootStore.accountStore.getBalance(this.token1);
			if (balance == null) return;
			const percent = total.times(100).div(balance);
			this.setLongPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	longPercent: BN = new BN(0);
	setLongPercent = (value: number | number[]) => (this.longPercent = new BN(value.toString()));

	longTotal: BN = BN.ZERO;
	setLongTotal = (total: BN, sync?: boolean) => {
		this.longTotal = total;
		if (this.longPrice.gt(0) && sync) {
			const v1 = BN.formatUnits(this.longPrice, this.token1.decimals);
			const v2 = BN.formatUnits(total, this.token1.decimals);
			this.setLongAmount(BN.parseUnits(v2.div(v1), this.token0.decimals));
			//todo add
			const balance = this.rootStore.accountStore.getBalance(this.token1);
			if (balance == null) return;
			const percent = total.times(100).div(balance);
			this.setLongPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	shortPrice: BN = BN.ZERO;
	setShortPrice = (price: BN, sync?: boolean) => {
		this.shortPrice = price;
		if (price.eq(0)) this.setShortTotal(BN.ZERO);
		if (this.shortAmount.gt(0) && price.gt(0) && sync) {
			const v1 = BN.formatUnits(price, this.token1.decimals);
			const v2 = BN.formatUnits(this.shortAmount, this.token0.decimals);
			this.setShortTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
		}
	};

	shortAmount: BN = BN.ZERO;
	setShortAmount = (amount: BN, sync?: boolean) => {
		this.shortAmount = amount;
		if (amount.eq(0)) this.setShortTotal(BN.ZERO);
		if (this.shortPrice.gt(0) && amount.gt(0) && sync) {
			const v1 = BN.formatUnits(this.shortPrice, this.token1.decimals);
			const v2 = BN.formatUnits(amount, this.token0.decimals);
			this.setShortTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
			const balance = this.rootStore.accountStore.getBalance(this.token0);
			if (balance == null) return;
			const percent = amount.times(100).div(balance);
			this.setShortPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};
	shortPercent: BN = new BN(0);
	setShortPercent = (value: number | number[]) => (this.shortPercent = new BN(value.toString()));

	shortTotal: BN = BN.ZERO;
	setShortTotal = (total: BN, sync?: boolean) => {
		this.shortTotal = total;
		if (this.shortPrice.gt(0) && sync) {
			const v1 = BN.formatUnits(this.shortPrice, this.token1.decimals);
			const v2 = BN.formatUnits(total, this.token1.decimals);
			const amount = BN.parseUnits(v2.div(v1), this.token0.decimals);
			this.setShortAmount(amount);
			const balance = this.rootStore.accountStore.getBalance(this.token0);
			if (balance == null) return;
			const percent = amount.times(100).div(balance);
			this.setShortPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	createOrder = async (action: OrderAction) => {};

	get canSell() {
		return (
			this.rootStore.accountStore.isLoggedIn && this.longAmount.gt(0) && this.longPrice.gt(0) && this.longTotal.gt(0)
		);
	}

	get canShort() {
		return (
			this.rootStore.accountStore.isLoggedIn && this.shortAmount.gt(0) && this.shortPrice.gt(0) && this.shortTotal.gt(0)
		);
	}
}
