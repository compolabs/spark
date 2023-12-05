import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import { CONTRACT_ADDRESSES, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import { ClearingHouseAbi, ClearingHouseAbi__factory, PerpMarketAbi, PerpMarketAbi__factory } from "@src/contracts";

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

	initialized: boolean = false;
	private setInitialized = (l: boolean) => (this.initialized = l);

	rejectUpdateStatePromise?: () => void;
	setRejectUpdateStatePromise = (v: any) => (this.rejectUpdateStatePromise = v);

	maxAbsPositionSize?: { long: BN; short: BN } | null = { long: new BN(71428571), short: new BN(71428571) };
	setMaxAbsPositionSize = (v: { long: BN; short: BN } | null) => (this.maxAbsPositionSize = v);

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		this.updateMarket();
		makeAutoObservable(this);
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
		const perpMarketAbi = PerpMarketAbi__factory.connect(CONTRACT_ADDRESSES.vault, wallet);
		if (this.rejectUpdateStatePromise != null) this.rejectUpdateStatePromise();

		const promise = new Promise((resolve, reject) => {
			this.rejectUpdateStatePromise = reject;
			resolve(
				Promise.all([
					this.updateMaxValueForMarket(clearingHouse),
					// this.calcMaxPositionSize(clearingHouse, perpMarketAbi),
				]),
			);
		});

		promise
			.catch((v) => console.error(v))
			.finally(() => {
				this.setInitialized(true);
				this.setRejectUpdateStatePromise(undefined);
			});
	};
	//todo display market in tab header
	updateMaxValueForMarket = async (clearingHouse: ClearingHouseAbi) => {
		console.log("setMaxAbsPositionSize");
		this.setMaxAbsPositionSize({ long: new BN(71428571), short: new BN(71428571) });
		// const { tradeStore, accountStore } = this.rootStore;
		// const addressInput = accountStore.addressInput;
		// const baseAsset = { value: TOKENS_BY_SYMBOL.BTC.assetId };
		// const contracts = tradeStore.contractsToRead;
		// if (addressInput == null || contracts == null) return;
		//
		// console.log(addressInput, baseAsset);
		// const result = await clearingHouse.functions
		// 	.get_max_abs_position_size(addressInput, baseAsset)
		// 	.addContracts([
		// 		contracts?.accountBalanceAbi,
		// 		contracts?.proxyAbi,
		// 		contracts?.clearingHouseAbi,
		// 		contracts?.vaultAbi,
		// 		contracts?.insuranceFundAbi,
		// 	])
		// 	.simulate();
		// console.log("result", result.value);
		// if (result.value != null) {
		// }
	};
	calcMaxPositionSize = async (clearingHouse: ClearingHouseAbi, perpMarket: PerpMarketAbi) => {
		const { tradeStore, accountStore } = this.rootStore;
		const addressInput = accountStore.addressInput;
		const baseAsset = { value: TOKENS_BY_SYMBOL.BTC.assetId };
		const contracts = tradeStore.contractsToRead;
		const contractToAdd = [
			contracts?.accountBalanceAbi,
			contracts?.proxyAbi,
			contracts?.clearingHouseAbi,
			contracts?.vaultAbi,
			contracts?.insuranceFundAbi,
		];
		// let res = await perpMarket.functions.get_mark_price(baseAsset).simulate();
		console.log("get_market");
		let res = await clearingHouse.functions.get_market(baseAsset).simulate();
		console.log("get_mark_price", res);

		// const baseAsset = { value: TOKENS_BY_SYMBOL.BTC.assetId };
		// const scale = 10 ** 8;
		// const markPrice =
		// let scale = 10.pow(market.decimal.as_u64());
		// let mark_price = perp_market_contract.get_mark_price(market.asset_id);
		//
		// let max_position_value = vault_contract.get_free_collateral(trader).mul_div(HUNDRED_PERCENT, market.im_ratio);
		//
		// let current_position_size = account_balance_contract.get_taker_position_size(trader, base_asset);
		//
		//
		// let max_position_size = max_position_value.mul_div(scale, mark_price).value;
		//
		// let mut result =(0,0);
		// if current_position_size > I64::new(){
		// 	result = (2 * current_position_size.value + max_position_size, max_position_size);
		//
		// } else{
		// 	result = (max_position_size, 2 * current_position_size.value + max_position_size);
		// }
		// log(result);
		// return result;
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

	isShort: boolean = false;
	setIsShort = (v: boolean) => (this.isShort = v);

	orderSize: BN = BN.ZERO;
	setOrderSize = (v: BN, sync?: boolean) => {
		const max = this.maxPositionSize;
		if (max == null) return;
		v.gte(max) ? (this.orderSize = max) : (this.orderSize = v);
		if (this.price.gt(0) && sync) {
			const size = BN.formatUnits(v, this.token0.decimals);
			const price = BN.formatUnits(this.price, this.token1.decimals);
			const value = BN.parseUnits(size.times(price), this.token1.decimals);
			this.setOrderValue(value);
		}
	};

	get formattedOrderSize() {
		return BN.formatUnits(this.orderSize, this.token0.decimals).toFormat(2);
	}

	orderValue: BN = BN.ZERO;
	setOrderValue = (v: BN, sync?: boolean) => {
		this.orderValue = v;
		if (this.price.gt(0) && sync) {
			const value = BN.formatUnits(v, this.token1.decimals);
			const price = BN.formatUnits(this.price, this.token1.decimals);
			const size = BN.parseUnits(value.div(price), this.token0.decimals);
			this.setOrderSize(size);
		}
	};

	get formattedOrderValue() {
		return BN.formatUnits(this.orderValue, this.token1.decimals).toFormat(2);
	}

	price: BN = new BN(BN.parseUnits(27000, this.token1.decimals));
	setPrice = (v: BN, sync?: boolean) => {
		this.price = v;
		if (this.orderValue.gt(0) && sync) {
			const value = BN.formatUnits(this.orderValue, this.token1.decimals);
			const price = BN.formatUnits(v, this.token1.decimals);
			const size = BN.parseUnits(price.div(value), this.token0.decimals);
			this.setOrderSize(size);
		}
	};

	get leverageSize() {
		const { tradeStore } = this.rootStore;
		const size = BN.formatUnits(this.orderSize, this.token0.decimals);
		const price = BN.formatUnits(this.price, this.token1.decimals);
		const freeColl = BN.formatUnits(tradeStore.freeCollateral ?? 0, this.token0.decimals);
		return size.times(price.div(freeColl)).div(100);
	}

	get leveragePercent() {
		return this.orderSize.times(100).div(this.maxPositionSize).toNumber();
	}

	onLeverageClick = (leverage: number) => {
		const { tradeStore } = this.rootStore;
		const collateral = BN.formatUnits(tradeStore.freeCollateral ?? 0, this.token1.decimals);
		const value = BN.parseUnits(collateral.times(leverage).times(100), this.token1.decimals);
		this.setOrderValue(value, true);
	};
	onMaxClick = () => {
		const price = BN.formatUnits(this.price, this.token1.decimals);
		const val = BN.formatUnits(this.maxPositionSize, this.token0.decimals);
		const value = BN.parseUnits(val.times(price), this.token1.decimals);
		this.setOrderSize(this.maxPositionSize, true);
		this.setOrderValue(value);
	};

	createOrder = async (action: OrderAction) => {
		// const clearingHouse = ClearingHouseAbi__factory.connect(CONTRACT_ADDRESSES.spotMarket, wallet);
	};
	getData = async () => {
		const { tradeStore, accountStore } = this.rootStore;
		const addressInput = accountStore.addressInput;
		const baseAsset = { value: TOKENS_BY_SYMBOL.BTC.assetId };
		const contracts = tradeStore.contractsToRead;
		if (addressInput == null || contracts == null) return;
		console.log(addressInput, baseAsset);

		const wallet = await accountStore.getWallet();
		if (wallet == null) return;
		const clearingHouse = ClearingHouseAbi__factory.connect(CONTRACT_ADDRESSES.spotMarket, wallet);

		const result = await clearingHouse.functions
			.get_max_abs_position_size(addressInput, baseAsset)
			.addContracts([
				contracts?.accountBalanceAbi,
				contracts?.proxyAbi,
				contracts?.clearingHouseAbi,
				contracts?.vaultAbi,
				contracts?.insuranceFundAbi,
			])
			// .txParams({ gasPrice: 1 })
			.simulate();
		console.log("result", result);
	};

	get maxPositionSize() {
		const max = this.isShort ? this.maxAbsPositionSize?.short : this.maxAbsPositionSize?.long;
		return max == null ? BN.ZERO : max;
	}
}
