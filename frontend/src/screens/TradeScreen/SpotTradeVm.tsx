import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import { CONTRACT_ADDRESSES, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import { SpotMarketAbi__factory } from "@src/contracts";
import { SpotTrade } from "@src/services/SpotMarketService";

const ctx = React.createContext<SpotTradeVm | null>(null);

interface IProps {
	children: React.ReactNode;
}

export const SpotTradeVMProvider: React.FC<IProps> = ({ children }) => {
	const rootStore = useStores();
	const store = useMemo(() => new SpotTradeVm(rootStore), [rootStore]);
	return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

type OrderAction = "buy" | "sell";

export const useTradeScreenVM = () => useVM(ctx);

class SpotTradeVm {
	public rootStore: RootStore;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		this.updateMarket();
		makeAutoObservable(this);
		this.getLatestTrades().then();
		reaction(
			() => this.rootStore.tradeStore.marketSymbol,
			() => {
				this.updateMarket();
				this.getLatestTrades();
			},
		);
		when(() => this.rootStore.oracleStore.initialized, this.initPriceToMarket);
		when(() => this.rootStore.spotOrdersStore.initialized, this.setMarketPrice);
	}

	initPriceToMarket = () => {
		const price =
			this.rootStore.oracleStore?.prices != null
				? new BN(this.rootStore.oracleStore?.prices[this.token0.priceFeed]?.price.toString())
				: BN.ZERO;
		const marketPrice = BN.formatUnits(price, 2);
		this.setBuyPrice(marketPrice);
		this.setSellPrice(marketPrice);
	};
	updateMarket = () => {
		const market = this.rootStore.tradeStore.market;
		if (market == null || market.type === "perp") return;
		this.setAssetId0(market?.token0.assetId);
		this.setAssetId1(market?.token1.assetId);
	};
	onMaxClick = () => {
		const tokenId = this.isSell ? this.assetId0 : this.assetId1;
		let balance = this.rootStore.accountStore.findBalanceByAssetId(tokenId)?.balance ?? BN.ZERO;
		if (tokenId === TOKENS_BY_SYMBOL.ETH.assetId) {
			balance = balance.minus(40);
		}
		this.isSell ? this.setSellAmount(balance, true) : this.setBuyTotal(balance, true);
	};

	public loading: boolean = false;
	private setLoading = (l: boolean) => (this.loading = l);

	public trades: Array<SpotTrade> = [];
	public setTrades = (v: Array<SpotTrade>) => (this.trades = v);

	get latestTrade() {
		if (this.trades.length === 0) return null;
		return this.trades[0];
	}

	public isSell = false;
	public setIsSell = (isSell: boolean) => (this.isSell = isSell);

	public activeModalAction: 0 | 1 = 0;
	public setActiveModalAction = (v: 0 | 1) => (this.activeModalAction = v);

	public assetId0: string = TOKENS_BY_SYMBOL.UNI.assetId;
	public setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

	public assetId1: string = TOKENS_BY_SYMBOL.USDC.assetId;
	public setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

	setMarketPrice = () => {
		const { orderbook } = this.rootStore.spotOrdersStore;
		const buy = orderbook.buy.sort((a, b) => (a.price > b.price ? -1 : 1));
		const sell = orderbook.sell.sort((a, b) => (a.price < b.price ? -1 : 1));
		const buyPrice = buy.length > 0 ? BN.parseUnits(buy[0].price, this.token1.decimals) : BN.ZERO;
		const sellPrice = sell.length > 0 ? BN.parseUnits(sell[0].price, this.token1.decimals) : BN.ZERO;
		this.setBuyPrice(sellPrice);
		this.setSellPrice(buyPrice);
	};

	getLatestTrades = async () => {
		// const data = await getLatestTradesInPair(`${this.token0.symbol}/${this.token1.symbol}`);
		// this.setTrades(data);
	};

	get token0() {
		return TOKENS_BY_ASSET_ID[this.assetId0];
	}

	get token1() {
		return TOKENS_BY_ASSET_ID[this.assetId1];
	}

	buyPrice: BN = BN.ZERO;
	setBuyPrice = (price: BN, sync?: boolean) => {
		this.buyPrice = price;
		if (price.eq(0)) this.setBuyTotal(BN.ZERO);
		if (this.buyAmount.gt(0) && price.gt(0) && sync) {
			const v1 = BN.formatUnits(price, this.token1.decimals);
			const v2 = BN.formatUnits(this.buyAmount, this.token0.decimals);
			this.setBuyTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
		}
	};

	buyAmount: BN = BN.ZERO;
	setBuyAmount = (amount: BN, sync?: boolean) => {
		this.buyAmount = amount;
		if (this.buyPrice.gt(0) && amount.gt(0) && sync) {
			const v1 = BN.formatUnits(this.buyPrice, this.token1.decimals);
			const v2 = BN.formatUnits(amount, this.token0.decimals);
			const total = BN.parseUnits(v2.times(v1), this.token1.decimals);
			this.setBuyTotal(total);
			const balance = this.rootStore.accountStore.getBalance(this.token1);
			if (balance == null) return;
			const percent = total.times(100).div(balance);
			this.setBuyPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	buyPercent: BN = new BN(0);
	setBuyPercent = (value: number | number[]) => (this.buyPercent = new BN(value.toString()));

	buyTotal: BN = BN.ZERO;
	setBuyTotal = (total: BN, sync?: boolean) => {
		this.buyTotal = total;
		if (this.buyPrice.gt(0) && sync) {
			const v1 = BN.formatUnits(this.buyPrice, this.token1.decimals);
			const v2 = BN.formatUnits(total, this.token1.decimals);
			this.setBuyAmount(BN.parseUnits(v2.div(v1), this.token0.decimals));
			const balance = this.rootStore.accountStore.getBalance(this.token1);
			if (balance == null) return;
			const percent = total.times(100).div(balance);
			this.setBuyPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	sellPrice: BN = BN.ZERO;
	setSellPrice = (price: BN, sync?: boolean) => {
		this.sellPrice = price;
		if (price.eq(0)) this.setSellTotal(BN.ZERO);
		if (this.sellAmount.gt(0) && price.gt(0) && sync) {
			const v1 = BN.formatUnits(price, this.token1.decimals);
			const v2 = BN.formatUnits(this.sellAmount, this.token0.decimals);
			this.setSellTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
		}
	};

	sellAmount: BN = BN.ZERO;
	setSellAmount = (amount: BN, sync?: boolean) => {
		this.sellAmount = amount;
		if (amount.eq(0)) this.setSellTotal(BN.ZERO);
		if (this.sellPrice.gt(0) && amount.gt(0) && sync) {
			const v1 = BN.formatUnits(this.sellPrice, this.token1.decimals);
			const v2 = BN.formatUnits(amount, this.token0.decimals);
			this.setSellTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
			const balance = this.rootStore.accountStore.getBalance(this.token0);
			if (balance == null) return;
			const percent = amount.times(100).div(balance);
			this.setSellPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};
	sellPercent: BN = new BN(0);
	setSellPercent = (value: number | number[]) => (this.sellPercent = new BN(value.toString()));

	sellTotal: BN = BN.ZERO;
	setSellTotal = (total: BN, sync?: boolean) => {
		this.sellTotal = total;
		if (this.sellPrice.gt(0) && sync) {
			const v1 = BN.formatUnits(this.sellPrice, this.token1.decimals);
			const v2 = BN.formatUnits(total, this.token1.decimals);
			const amount = BN.parseUnits(v2.div(v1), this.token0.decimals);
			this.setSellAmount(amount);
			const balance = this.rootStore.accountStore.getBalance(this.token0);
			if (balance == null) return;
			const percent = amount.times(100).div(balance);
			this.setSellPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	get canBuy() {
		return (
			this.rootStore.accountStore.isLoggedIn &&
			this.buyAmount.gt(0) &&
			this.buyPrice.gt(0) &&
			this.buyTotal.gt(0) &&
			!this.buyTotalError
		);
	}

	get canSell() {
		return (
			this.rootStore.accountStore.isLoggedIn &&
			this.sellAmount.gt(0) &&
			this.sellPrice.gt(0) &&
			this.sellTotal.gt(0) &&
			!this.sellAmountError
		);
	}

	get matcherFee() {
		return "1000";
	}

	createOrder = async (action: OrderAction) => {
		const { accountStore } = this.rootStore;
		await accountStore.checkConnectionWithWallet();
		if (accountStore.address == null) return;
		const wallet = await accountStore.getWallet();
		if (wallet == null) return;
		const limitOrdersContract = SpotMarketAbi__factory.connect(CONTRACT_ADDRESSES.spotMarket, wallet);
		if (limitOrdersContract == null) return;
		let token0 = null;
		let token1 = null;
		let amount0 = null;
		let amount1 = null;
		if (action === "buy") {
			token0 = this.assetId1;
			token1 = this.assetId0;
			amount0 = this.buyTotal.toFixed(0).toString();
			amount1 = this.buyAmount.toFixed(0).toString();
		}
		if (action === "sell") {
			token0 = this.assetId0;
			token1 = this.assetId1;
			amount0 = this.sellAmount.toFixed(0).toString();
			amount1 = this.sellTotal.toFixed(0).toString();
		}
		if (token0 == null || token1 == null || amount0 == null || amount1 == null) return;

		this.setLoading(true);
		try {
			await limitOrdersContract
				.multiCall([
					limitOrdersContract.functions.deposit().callParams({
						forward: {
							amount: "100000",
							assetId: TOKENS_BY_SYMBOL.ETH.assetId,
						},
					}),
					limitOrdersContract.functions
						.create_order({ value: token1 }, amount1, this.matcherFee)
						.callParams({ forward: { amount: amount0, assetId: token0 } }),
				])
				.txParams({ gasPrice: 1 })
				.call()
				.then(({ transactionResult }) => {
					transactionResult && this.notifyThatActionIsSuccessful("Order has been placed", transactionResult.id ?? "");
				})
				.then(() => this.rootStore.spotOrdersStore.sync());
		} catch (e) {
			const error = JSON.parse(JSON.stringify(e)).toString();
			this.rootStore.notificationStore.toast(error.error, { type: "error" });
			console.error(e);
		} finally {
			await this.rootStore.spotOrdersStore.sync();
			this.setLoading(false);
		}
	};

	cancelOrder = async (id: string) => {
		const { accountStore } = this.rootStore;
		if (accountStore.address == null) return;
		await accountStore.checkConnectionWithWallet();
		const wallet = await accountStore.getWallet();
		if (wallet == null) return;
		const limitOrdersContract = SpotMarketAbi__factory.connect(CONTRACT_ADDRESSES.spotMarket, wallet);
		if (limitOrdersContract == null) return;

		this.setLoading(true);
		try {
			await limitOrdersContract.functions
				.cancel_order(id)
				.txParams({ gasPrice: 1 })
				.call()
				.then(
					({ transactionResult }: any) =>
						transactionResult && this.notifyThatActionIsSuccessful("Order has been canceled", transactionResult.id ?? ""),
				)
				.then(() => {
					const { mySpotOrders } = this.rootStore.spotOrdersStore;
					const index = mySpotOrders.findIndex((obj) => obj.id === id);
					mySpotOrders.splice(index, 1);
				});
			//todo add update
		} catch (e) {
			this.notifyError(JSON.parse(JSON.stringify(e)).toString(), e);
		} finally {
			this.setLoading(false);
		}
	};

	get buyTotalError(): boolean {
		const { accountStore } = this.rootStore;
		const balance = accountStore.getBalance(this.token1);
		return balance == null ? false : this.buyTotal.gt(balance);
	}

	get sellAmountError(): boolean | undefined {
		const { accountStore } = this.rootStore;
		const balance = accountStore.getBalance(this.token0);
		return balance == null ? false : this.sellAmount.gt(balance);
	}

	notifyThatActionIsSuccessful = (title: string, txId: string) => {
		this.rootStore.notificationStore.toast(title, {
			type: "success",
		});
	};
	notifyError = (title: string, error: any) => {
		console.error(error);
		this.rootStore.notificationStore.toast(title, {
			type: "error",
		});
	};
}
