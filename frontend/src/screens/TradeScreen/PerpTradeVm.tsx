import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import { CONTRACT_ADDRESSES, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import { ClearingHouseAbi, ClearingHouseAbi__factory, VaultAbi, VaultAbi__factory } from "@src/contracts";

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

//get_max_abs_position_size вернет значение в графу order size,
// ордер value посчитайте на фронте умножив на цену которую указал пользователь
export const usePerpTradeVM = () => useVM(ctx);

class PerpTradeVm {
	public rootStore: RootStore;

	initialized: boolean = false;
	private setInitialized = (l: boolean) => (this.initialized = l);

	rejectUpdateStatePromise?: () => void;
	setRejectUpdateStatePromise = (v: any) => (this.rejectUpdateStatePromise = v);

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		this.updateMarket();
		reaction(
			() => [this.rootStore.tradeStore.marketSymbol],
			() => this.updateMarket(),
		);
	}

	updateMarket = async () => {
		const { tradeStore, accountStore } = this.rootStore;
		const market = tradeStore.market;
		if (market == null || market.type === "spot") return;
		this.setAssetId0(market?.token0.assetId);
		this.setAssetId1(market?.token1.assetId);
		const wallet = await accountStore.getWallet();
		if (wallet == null) return;
		const clearingHouse = ClearingHouseAbi__factory.connect(CONTRACT_ADDRESSES.vault, wallet);
		if (this.rejectUpdateStatePromise != null) this.rejectUpdateStatePromise();

		const promise = new Promise((resolve, reject) => {
			this.rejectUpdateStatePromise = reject;
			resolve(Promise.all([this.updateMaxValueForMarket(clearingHouse)]));
		});

		promise
			.catch((v) => console.error(v))
			.finally(() => {
				this.setInitialized(true);
				this.setRejectUpdateStatePromise(undefined);
			});
	};
	updateMaxValueForMarket = async (clearingHouse: ClearingHouseAbi) => {
		console.log("updateMaxValueForMarket")
		const { tradeStore } = this.rootStore;
		const addressInput = this.rootStore.accountStore.addressInput;
		// const baseAsset = { value: tradeStore.market?.token0.assetId ?? "" };
		const baseAsset = { value: TOKENS_BY_SYMBOL.USDC.assetId };
		console.log("addressInput", addressInput)
		console.log("baseAsset", baseAsset)
		if (addressInput == null || baseAsset == null) return;
		// const contracts = tradeStore.contractsToRead;
		// if (contracts == null) return;

		const result = await clearingHouse.functions
			.get_max_abs_position_size(addressInput, baseAsset)
			// .addContracts([
			// 	contracts?.accountBalanceAbi,
			// 	contracts?.proxyAbi,
			// 	contracts?.clearingHouseAbi,
			// 	contracts?.insuranceFundAbi,
			// ])
			.simulate();
		console.log("result", result)
		if (result.value != null) {
			console.log("get_max_abs_position_size", result.value);
		}
	};

	loading: boolean = false;
	setLoading = (l: boolean) => (this.loading = l);

	assetId0: string = TOKENS_BY_SYMBOL.UNI.assetId;
	setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

	assetId1: string = TOKENS_BY_SYMBOL.USDC.assetId;
	setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

	get token0() {
		return TOKENS_BY_ASSET_ID[this.assetId0];
	}

	get token1() {
		return TOKENS_BY_ASSET_ID[this.assetId1];
	}

	openOrder = async () => {
		const { accountStore, oracleStore } = this.rootStore;
		await accountStore.checkConnectionWithWallet();
		try {
			this.setLoading(true);
			const ch = CONTRACT_ADDRESSES.clearingHouse;
			const wallet = await accountStore.getWallet();
			if (wallet == null) return;
			const clearingHouse = ClearingHouseAbi__factory.connect(ch, wallet);

			const btcToken = TOKENS_BY_SYMBOL.BTC;
			const baseToken = { value: btcToken.assetId };
			//todo what is baseSize?
			const btcPrice = BN.parseUnits(TOKENS_BY_SYMBOL.USDC.decimals, 28000).toString();
			const baseSize = { value: btcPrice, negative: false };
			//todo how much of eth for pyth do i need to add?
			if (oracleStore.updateData == null) return;

			// const v = Address.fromAddressOrString(priceUpdate).toBytes();
			// const m = base64ToArrayBuffer(priceUpdate);
			const { transactionResult } = await clearingHouse.functions
				.open_order(baseToken, baseSize, btcPrice, oracleStore.updateData)
				.txParams({ gasPrice: 1 })
				.call();
			console.log("transactionResult", transactionResult);
		} catch (e) {
			console.log(e);
		} finally {
			this.setLoading(false);
		}
	};

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
