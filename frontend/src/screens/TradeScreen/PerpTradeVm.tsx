import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";

const ctx = React.createContext<PerpTradeVm | null>(null);

interface IProps {
	children: React.ReactNode;
	marketSymbol: string;
}

export const PerpTradeVMProvider: React.FC<IProps> = ({ children, marketSymbol }) => {
	const rootStore = useStores();
	const store = useMemo(() => new PerpTradeVm(rootStore, marketSymbol), [rootStore, marketSymbol]);
	return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

type OrderAction = "long" | "short";

export const usePerpTradeVM = () => useVM(ctx);

class PerpTradeVm {
	public marketSymbol: string;
	public rootStore: RootStore;

	constructor(rootStore: RootStore, marketSymbol: string) {
		this.marketSymbol = marketSymbol;
		this.rootStore = rootStore;
		const market = this.rootStore.marketsStore.markets.find(
			({ symbol, type }) => symbol === marketSymbol && type === "spot",
		);
		if (market == null) return;
		this.setAssetId0(market?.token0.assetId);
		this.setAssetId1(market?.token1.assetId);
		makeAutoObservable(this);
	}

	public loading: boolean = false;
	private setLoading = (l: boolean) => (this.loading = l);

	public isShort = false;
	public setIsShort = (v: boolean) => (this.isShort = v);

	public activeModalAction: 0 | 1 = 0;
	public setActiveModalAction = (v: 0 | 1) => (this.activeModalAction = v);

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
	setBuyPrice = (price: BN, sync?: boolean) => {
		this.longPrice = price;
		if (price.eq(0)) this.setBuyTotal(BN.ZERO);
		if (this.longAmount.gt(0) && price.gt(0) && sync) {
			const v1 = BN.formatUnits(price, this.token1.decimals);
			const v2 = BN.formatUnits(this.longAmount, this.token0.decimals);
			this.setBuyTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
		}
	};

	longAmount: BN = BN.ZERO;
	setBuyAmount = (amount: BN, sync?: boolean) => {
		this.longAmount = amount;
		if (this.longPrice.gt(0) && amount.gt(0) && sync) {
			const v1 = BN.formatUnits(this.longPrice, this.token1.decimals);
			const v2 = BN.formatUnits(amount, this.token0.decimals);
			const total = BN.parseUnits(v2.times(v1), this.token1.decimals);
			this.setBuyTotal(total);
			const balance = this.rootStore.accountStore.getBalance(this.token1);
			if (balance == null) return;
			const percent = total.times(100).div(balance);
			this.setBuyPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	longPercent: BN = new BN(0);
	setBuyPercent = (value: number | number[]) => (this.longPercent = new BN(value.toString()));

	longTotal: BN = BN.ZERO;
	setBuyTotal = (total: BN, sync?: boolean) => {
		this.longTotal = total;
		if (this.longPrice.gt(0) && sync) {
			const v1 = BN.formatUnits(this.longPrice, this.token1.decimals);
			const v2 = BN.formatUnits(total, this.token1.decimals);
			this.setBuyAmount(BN.parseUnits(v2.div(v1), this.token0.decimals));
			//todo add
			const balance = this.rootStore.accountStore.getBalance(this.token1);
			if (balance == null) return;
			const percent = total.times(100).div(balance);
			this.setBuyPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	shortPrice: BN = BN.ZERO;
	setSellPrice = (price: BN, sync?: boolean) => {
		this.shortPrice = price;
		if (price.eq(0)) this.setSellTotal(BN.ZERO);
		if (this.shortAmount.gt(0) && price.gt(0) && sync) {
			const v1 = BN.formatUnits(price, this.token1.decimals);
			const v2 = BN.formatUnits(this.shortAmount, this.token0.decimals);
			this.setSellTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
		}
	};

	shortAmount: BN = BN.ZERO;
	setSellAmount = (amount: BN, sync?: boolean) => {
		this.shortAmount = amount;
		if (amount.eq(0)) this.setSellTotal(BN.ZERO);
		if (this.shortPrice.gt(0) && amount.gt(0) && sync) {
			const v1 = BN.formatUnits(this.shortPrice, this.token1.decimals);
			const v2 = BN.formatUnits(amount, this.token0.decimals);
			this.setSellTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
			const balance = this.rootStore.accountStore.getBalance(this.token0);
			if (balance == null) return;
			const percent = amount.times(100).div(balance);
			this.setSellPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};
	shortPercent: BN = new BN(0);
	setSellPercent = (value: number | number[]) => (this.shortPercent = new BN(value.toString()));

	shortTotal: BN = BN.ZERO;
	setSellTotal = (total: BN, sync?: boolean) => {
		this.shortTotal = total;
		if (this.shortPrice.gt(0) && sync) {
			const v1 = BN.formatUnits(this.shortPrice, this.token1.decimals);
			const v2 = BN.formatUnits(total, this.token1.decimals);
			const amount = BN.parseUnits(v2.div(v1), this.token0.decimals);
			this.setSellAmount(amount);
			const balance = this.rootStore.accountStore.getBalance(this.token0);
			if (balance == null) return;
			const percent = amount.times(100).div(balance);
			this.setSellPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
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
