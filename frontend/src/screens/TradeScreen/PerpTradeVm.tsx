import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import { CONTRACT_ADDRESSES, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import {
	AccountBalanceAbi__factory,
	ClearingHouseAbi__factory,
	InsuranceFundAbi__factory,
	PerpMarketAbi__factory,
	ProxyAbi__factory,
	PythContractAbi__factory,
	TokenAbi__factory,
	VaultAbi__factory,
} from "@src/contracts";
import { PerpMarket } from "@src/services/ClearingHouseServise";
import { arrayify, sleep } from "fuels";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

const ctx = React.createContext<PerpTradeVm | null>(null);

interface IProps {
	children: React.ReactNode;
}

export const PerpTradeVMProvider: React.FC<IProps> = ({ children }) => {
	const rootStore = useStores();
	const store = useMemo(() => new PerpTradeVm(rootStore), [rootStore]);
	return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const usePerpTradeVM = () => useVM(ctx);

class PerpTradeVm {
	public rootStore: RootStore;

	initialized: boolean = false;
	private setInitialized = (l: boolean) => (this.initialized = l);

	maxAbsPositionSize?: { long: BN; short: BN } | null = null;
	setMaxAbsPositionSize = (v: { long: BN; short: BN } | null) => (this.maxAbsPositionSize = v);

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		this.updateMarket();
		makeAutoObservable(this);
		reaction(
			() => [this.rootStore.tradeStore.marketSymbol, this.rootStore.tradeStore.contracts != null],
			() => this.updateMarket(),
		);
		when(() => this.rootStore.oracleStore.initialized, this.initPriceToMarket);
		reaction(
			() => [
				this.rootStore.tradeStore.perpMarkets,
				this.rootStore.tradeStore.perpPrices,
				this.rootStore.tradeStore.freeCollateral,
				this.rootStore.tradeStore.positions,
			],
			() => this.calcMaxPositionSize(),
		);
	}

	updateMarket = async () => {
		const { tradeStore } = this.rootStore;
		const market = tradeStore.market;
		if (market == null || market.type === "spot") return;
		this.setAssetId0(market?.token0.assetId);
		this.setAssetId1(market?.token1.assetId);
		await this.updateMaxValueForMarket();
		this.setInitialized(true);
	};

	calcMaxPositionSize = async () => {
		const HUNDRED_PERCENT = 1_000_000;
		const { tradeStore } = this.rootStore;
		const market = tradeStore.currentMarket;
		if (market == null) return;
		if (!(market instanceof PerpMarket)) return;
		const scale = BN.parseUnits(1, market.decimal);
		const markPrice = tradeStore.perpPrices != null ? tradeStore.perpPrices[market.symbol]?.markPrice : null;
		if (tradeStore.freeCollateral == null || markPrice == null) return;
		const maxPositionValue = tradeStore.freeCollateral?.times(HUNDRED_PERCENT).div(market.imRatio);
		const maxPositionSize = maxPositionValue.times(scale).div(markPrice);
		const currentPositionSize =
			this.rootStore.tradeStore.positions.find(({ symbol }) => symbol === market.symbol)?.takerPositionSize ?? BN.ZERO;

		let long = BN.ZERO;
		let short = BN.ZERO;
		if (currentPositionSize.gt(0)) {
			short = maxPositionSize;
			long = currentPositionSize.abs().plus(maxPositionSize).times(2);
			this.setMaxAbsPositionSize({ long: BN.ZERO, short: BN.ZERO });
		} else {
			long = maxPositionSize;
			short = currentPositionSize.abs().plus(maxPositionSize).times(2);
		}

		const roundLong = new BN(long.toFixed(0).toString());
		const roundShort = new BN(short.toFixed(0).toString());
		this.setMaxAbsPositionSize({ long: roundLong, short: roundShort });
	};
	updateMaxValueForMarket = async () => {
		const { accountStore } = this.rootStore;
		const addressInput = accountStore.addressInput;
		// const baseAsset = { value: this.token0.assetId };
		if (addressInput == null) return;
		//todo change to indexer calc

		// const result = await tradeStore.contracts?.clearingHouseContract.functions
		// 	.get_max_abs_position_size(addressInput, baseAsset)
		// 	.addContracts(tradeStore.contractsArray)
		// 	.simulate();
		// if (result?.value != null) {
		// 	const value = result.value;
		// 	const short = new BN(value[0].toString());
		// 	const long = new BN(value[1].toString());
		// 	this.setMaxAbsPositionSize({ long, short });
		// }
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

	initPriceToMarket = () => {
		const price =
			this.rootStore.oracleStore?.prices != null
				? new BN(this.rootStore.oracleStore?.prices[this.token0.priceFeed]?.price.toString())
				: BN.ZERO;
		const marketPrice = BN.formatUnits(price, 2);
		this.setPrice(marketPrice);
	};
	openOrder = async () => {
		console.log("perp openOrder");
		// const { accountStore, oracleStore, tradeStore } = this.rootStore;
		const { oracleStore } = this.rootStore;
		if (oracleStore.updateData == null) return;
		// await accountStore.checkConnectionWithWallet();
		// const contract = tradeStore.contracts;
		// if (contract == null) return;
		try {
			this.setLoading(true);
			const fee = await oracleStore.getPythFee();
			if (fee == null) return;
			// const baseAsset = { value: this.token0.assetId };
			// const price = this.price.toFixed(0).toString();
			// const size = { value: this.orderSize.toFixed(0).toString(), negative: this.isShort };
			const wallet = await this.rootStore.accountStore.getWallet();
			if (wallet == null) return;
			// const clearingHouseContract = new Contract(CONTRACT_ADDRESSES.clearingHouse, ClearingHouseAbi__factory.abi, wallet);
			const clearingHouseContract = ClearingHouseAbi__factory.connect(CONTRACT_ADDRESSES.clearingHouse, wallet);
			const proxyContract = ProxyAbi__factory.connect(CONTRACT_ADDRESSES.proxy, wallet);
			const accountBalanceContract = AccountBalanceAbi__factory.connect(CONTRACT_ADDRESSES.accountBalance, wallet);
			const insuranceFundContract = InsuranceFundAbi__factory.connect(CONTRACT_ADDRESSES.insuranceFund, wallet);
			const perpMarketContract = PerpMarketAbi__factory.connect(CONTRACT_ADDRESSES.perpMarket, wallet);
			const vaultMarketContract = VaultAbi__factory.connect(CONTRACT_ADDRESSES.vault, wallet);
			const pythContract = PythContractAbi__factory.connect(CONTRACT_ADDRESSES.pyth, wallet);

			const baseAsset = { value: this.token0.assetId };
			const price = "41637961421";
			const size = { value: "11572614", negative: false };

			console.log({
				baseAsset: baseAsset,
				price: price,
				size: size,
			});
			console.log("fee", fee);
			const res = await clearingHouseContract.functions
				.open_order(baseAsset, size, price, oracleStore.updateData)
				.addContracts([
					proxyContract,
					accountBalanceContract,
					insuranceFundContract,
					perpMarketContract,
					vaultMarketContract,
					pythContract,
				])
				.callParams({ forward: { amount: fee ?? "", assetId: TOKENS_BY_SYMBOL.ETH.assetId } })
				.txParams({ gasPrice: 1 })
				.call();
			console.log("get_market", res);
			// await clearingHouseContract.functions
			// 	.open_order(baseAsset, size, price, oracleStore.updateData)
			// 	.addContracts([
			// 		proxyContract,
			// 		accountBalanceContract,
			// 		insuranceFundContract,
			// 		perpMarketContract,
			// 		vaultMarketContract,
			// 		pythContract,
			// 	])
			// 	.callParams({ forward: { amount: fee ?? "", assetId: TOKENS_BY_SYMBOL.ETH.assetId } })
			// 	.txParams({ gasPrice: 1 })
			// 	.call()
			// 	.then(({ transactionResult }) => {
			// 		console.log("transactionResult", transactionResult);
			// 		transactionResult && this.notifyThatActionIsSuccessful("Order has been placed", transactionResult.id ?? "");
			// 	});
			console.timeEnd("openOrder");
		} catch (e) {
			console.log(e);
		} finally {
			this.setLoading(false);
		}
	};

	sergioTestCase = async () => {
		// pyth prices
		const connection = new EvmPriceServiceConnection("https://xc-mainnet.pyth.network");
		const priceIds = ["0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"];
		const updateData = await connection.getPriceFeedsUpdateData(priceIds);
		const parsedUpdateData = updateData.map((v) => Array.from(arrayify(v)));
		console.log("parsedUpdateData from pyth", parsedUpdateData);

		try {
			const { accountStore } = this.rootStore;
			const wallet = await accountStore.getWallet();
			if (wallet == null) return;
			const tokenFactoryContract = TokenAbi__factory.connect(CONTRACT_ADDRESSES.tokenFactory, wallet);
			const clearingHouseContract = ClearingHouseAbi__factory.connect(CONTRACT_ADDRESSES.clearingHouse, wallet);
			const proxyContract = ProxyAbi__factory.connect(CONTRACT_ADDRESSES.proxy, wallet);
			const accountBalanceContract = AccountBalanceAbi__factory.connect(CONTRACT_ADDRESSES.accountBalance, wallet);
			const insuranceFundContract = InsuranceFundAbi__factory.connect(CONTRACT_ADDRESSES.insuranceFund, wallet);
			const perpMarketContract = PerpMarketAbi__factory.connect(CONTRACT_ADDRESSES.perpMarket, wallet);
			const vaultContract = VaultAbi__factory.connect(CONTRACT_ADDRESSES.vault, wallet);
			const pythContract = PythContractAbi__factory.connect(CONTRACT_ADDRESSES.pyth, wallet);

			console.log("start of mint");
			const usdc = "0xe47db7a897c11f167f4404d0167987d252ea3d965dfeef79461958562f8860ff";
			// //3000 usdc
			const mintAmount = BN.parseUnits(3000, 6).toString();
			// const hash = hashMessage("USDC");
			// const identity = { Address: { value: wallet.address.toB256() } };
			// await tokenFactoryContract.functions.mint(identity, hash, mintAmount).txParams({ gasPrice: 1 }).call();
			// console.log("minted usdc");

			await sleep(5000);

			console.log("start of deposit");
			await vaultContract.functions
				.deposit_collateral()
				.callParams({ forward: { amount: mintAmount, assetId: usdc } })
				.txParams({ gasPrice: 1 })
				.call();
			console.log("deposited usdc");

			await sleep(5000);

			const btc = "0x26829bff466f19001665597228458372fd57cbd325864c7118b5eb5441c42157";
			const eth = "0x0000000000000000000000000000000000000000000000000000000000000000";
			const baseAssetOfBTCMarket = { value: btc };
			const price = "41637961421"; //market price of btc
			const size = { value: "11572614", negative: false }; // position size, negative shows if it short or long position

			await clearingHouseContract.functions
				.open_order(baseAssetOfBTCMarket, size, price, parsedUpdateData)
				.addContracts([
					proxyContract,
					accountBalanceContract,
					insuranceFundContract,
					perpMarketContract,
					vaultContract,
					pythContract,
				])
				.callParams({ forward: { amount: 1, assetId: eth } }) //this is to pay pyth for price update
				.txParams({ gasPrice: 1 })
				.call();
			console.log("opened postion in btc market");
		} catch (e) {
			console.error(e);
		}
	};
	closeOrder = async () => {};

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

	price: BN = BN.ZERO;
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
		if (freeColl.eq(0)) return BN.ZERO;
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

	get maxPositionSize() {
		const max = this.isShort ? this.maxAbsPositionSize?.short : this.maxAbsPositionSize?.long;
		return max == null ? BN.ZERO : max;
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
