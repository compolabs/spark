import { makeAutoObservable, reaction } from "mobx";
import RootStore from "@stores/RootStore";
import { CONTRACT_ADDRESSES, IToken, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import {
	AccountBalanceAbi,
	AccountBalanceAbi__factory,
	ClearingHouseAbi,
	ClearingHouseAbi__factory,
	InsuranceFundAbi,
	InsuranceFundAbi__factory,
	PerpMarketAbi,
	PerpMarketAbi__factory,
	ProxyAbi,
	ProxyAbi__factory,
	PythContractAbi,
	PythContractAbi__factory,
	VaultAbi,
	VaultAbi__factory,
} from "@src/contracts";
import { getPerpMarkets, PerpMarket } from "@src/services/ClearingHouseServise";
import { getUserPositions, PerpPosition } from "@src/services/AccountBalanceServise";
import {
	getPerpMarketPrices,
	getPerpOrders,
	getPerpTrades,
	getUserPerpOrders,
	PerpMarketPrice,
	PerpOrder,
	PerpTrade,
} from "@src/services/PerpMarketService";
import { getUserFreeCollateral } from "@src/services/VaultServise";
import { sleep } from "fuels";

export interface SpotMarket {
	token0: IToken;
	token1: IToken;
	type: string;
	price?: BN;
	change24?: BN;
	symbol: string;
	leverage: null;
}

interface ContractConfig {
	proxyContract: ProxyAbi;
	accountBalanceContract: AccountBalanceAbi;
	clearingHouseContract: ClearingHouseAbi;
	insuranceFundContract: InsuranceFundAbi;
	perpMarketContract: PerpMarketAbi;
	vaultContract: VaultAbi;
	pythContract: PythContractAbi;
}

export interface ISerializedTradeStore {
	favMarkets: string | null;
}

const spotMarketsConfig = [{ token0: TOKENS_BY_SYMBOL.UNI, token1: TOKENS_BY_SYMBOL.USDC }].map((v) => ({
	...v,
	symbol: `${v.token0.symbol}-${v.token1.symbol}`,
	type: "spot",
	leverage: null,
}));

class TradeStore {
	public rootStore: RootStore;

	constructor(rootStore: RootStore, initState?: ISerializedTradeStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
		this.setSpotMarkets(spotMarketsConfig);
		this.initContracts();
		this.syncUserDataFromIndexer();
		this.syncDataFromIndexer();
		reaction(() => this.rootStore.accountStore.address, this.syncUserDataFromIndexer);
		setInterval(this.syncDataFromIndexer, 30 * 1000);

		if (initState != null) {
			const markets = initState.favMarkets ?? "";
			this.setFavMarkets(markets.split(","));
		}
	}

	contracts: ContractConfig | null = null;
	private setContract = (c: ContractConfig | null) => (this.contracts = c);

	initContracts = async () => {
		const { accountStore } = this.rootStore;
		const wallet = await accountStore.getWallet();
		if (wallet == null) return;
		const proxyContract = ProxyAbi__factory.connect(CONTRACT_ADDRESSES.proxy, wallet);
		const accountBalanceContract = AccountBalanceAbi__factory.connect(CONTRACT_ADDRESSES.accountBalance, wallet);
		const clearingHouseContract = ClearingHouseAbi__factory.connect(CONTRACT_ADDRESSES.clearingHouse, wallet);
		const insuranceFundContract = InsuranceFundAbi__factory.connect(CONTRACT_ADDRESSES.insuranceFund, wallet);
		const perpMarketContract = PerpMarketAbi__factory.connect(CONTRACT_ADDRESSES.perpMarket, wallet);
		const vaultContract = VaultAbi__factory.connect(CONTRACT_ADDRESSES.vault, wallet);
		const pythContract = PythContractAbi__factory.connect(CONTRACT_ADDRESSES.pyth, wallet);
		this.setContract({
			proxyContract,
			accountBalanceContract,
			clearingHouseContract,
			insuranceFundContract,
			perpMarketContract,
			vaultContract,
			pythContract,
		});
	};

	freeCollateral: BN | null = null;
	setFreeCollateral = (v: BN | null) => (this.freeCollateral = v);

	marketSymbol: string | null = null;
	setMarketSymbol = (v: string) => (this.marketSymbol = v);

	openInterest: BN | null = null;
	setOpenInterest = (v: BN | null) => (this.openInterest = v);

	get marketsConfig(): Record<string, SpotMarket | PerpMarket> {
		return [...spotMarketsConfig, ...this.perpMarkets].reduce(
			(acc, item) => {
				acc[item.symbol] = item;
				return acc;
			},
			{} as Record<string, SpotMarket | PerpMarket>,
		);
	}

	initialized: boolean = false;
	private setInitialized = (l: boolean) => (this.initialized = l);
	loading: boolean = false;
	private _setLoading = (l: boolean) => (this.loading = l);

	spotMarkets: SpotMarket[] = [];
	private setSpotMarkets = (v: SpotMarket[]) => (this.spotMarkets = v);

	perpMarkets: PerpMarket[] = [];
	private setPerpMarkets = (v: PerpMarket[]) => (this.perpMarkets = v);

	positions: PerpPosition[] = [];
	private setPosition = (v: PerpPosition[]) => (this.positions = v);

	perpUserOrders: PerpOrder[] = [];
	private setPerpUserOrders = (v: PerpOrder[]) => (this.perpUserOrders = v);

	perpOrders: PerpOrder[] = [];
	private setPerpOrders = (v: PerpOrder[]) => (this.perpOrders = v);

	perpTrades: PerpTrade[] = [];

	private setPerpTrades = (v: PerpTrade[]) => (this.perpTrades = v);

	perpPrices: Record<string, PerpMarketPrice> | null = null;
	private setPerpPrices = (v: Record<string, PerpMarketPrice> | null) => (this.perpPrices = v);

	get marketPrice() {
		if (this.marketSymbol == null) return BN.ZERO;
		return this.perpPrices == null ? BN.ZERO : this.perpPrices[this.marketSymbol]?.marketPrice;
	}

	get markPrice() {
		if (this.marketSymbol == null) return BN.ZERO;
		return this.perpPrices == null ? BN.ZERO : this.perpPrices[this.marketSymbol]?.markPrice;
	}

	get fundingRate() {
		//fundingRate := sign(marketPrice - indexPrice) * min(abs((marketPrice - indexPrice)/indexPrice), max_funding_rate/1e6)/24
		const { oracleStore } = this.rootStore;
		const { market } = this.rootStore.tradeStore;
		const token = market?.token0;
		if (token == null || this.marketPrice == null) return BN.ZERO;
		const indexPrice = oracleStore.getTokenIndexPrice(token.priceFeed);
		const diff = this.marketPrice.minus(indexPrice);
		const sign = diff.gt(0) ? 1 : -1;
		const formattedMaxFundingRate = BN.formatUnits(200000, 6); //1e6
		const min = BN.min(diff.abs().div(indexPrice), formattedMaxFundingRate).div(24);
		return min.times(sign).times(100); //because percent
	}

	favMarkets: string[] = [];
	setFavMarkets = (v: string[]) => (this.favMarkets = v);

	serialize = (): ISerializedTradeStore => ({
		favMarkets: this.favMarkets.join(","),
	});
	addToFav = (marketId: string) => {
		if (!this.favMarkets.includes(marketId)) {
			this.setFavMarkets([...this.favMarkets, marketId]);
		}
		console.log(this.favMarkets);
	};
	removeFromFav = (marketId: string) => {
		const index = this.favMarkets.indexOf(marketId);
		index !== -1 && this.favMarkets.splice(index, 1);
	};

	get defaultMarketSymbol() {
		return this.spotMarkets[0].symbol;
	}

	get market() {
		return this.marketSymbol == null ? null : this.marketsConfig[this.marketSymbol];
	}

	get isMarketPerp() {
		return this.marketSymbol == null ? false : this.marketSymbol.includes("-PERP");
	}

	get currentMarket() {
		return this.marketSymbol == null ? null : this.marketsConfig[this.marketSymbol];
	}

	marketSelectionOpened: boolean = false;
	setMarketSelectionOpened = (s: boolean) => (this.marketSelectionOpened = s);

	deposit = async (amount: BN) => {
		const { accountStore } = this.rootStore;
		await accountStore.checkConnectionWithWallet();
		try {
			this._setLoading(true);
			const wallet = await accountStore.getWallet();
			if (wallet == null || this.contracts == null) return;
			const result = await this.contracts.vaultContract.functions
				.deposit_collateral()
				.callParams({
					forward: { amount: amount.toString(), assetId: TOKENS_BY_SYMBOL.USDC.assetId },
				})
				.txParams({ gasPrice: 1 })
				.call();
			if (result != null) {
				const formattedAmount = BN.formatUnits(amount, TOKENS_BY_SYMBOL.USDC.decimals).toFormat(2);
				this.notifyThatActionIsSuccessful(`You have successfully deposited ${formattedAmount} USDC`);
			}
			await sleep(3000);
			await this.rootStore.accountStore.updateAccountBalances();
			const newCollBalance = await getUserFreeCollateral(this.rootStore.accountStore.indexerAddress);
			this.setFreeCollateral(newCollBalance);
		} catch (e) {
			const errorText = e?.toString();
			this.notifyError(errorText ?? "", { type: "error" });
		} finally {
			this._setLoading(false);
		}
	};
	withdraw = async (amount: BN) => {
		const { accountStore, oracleStore } = this.rootStore;
		await accountStore.checkConnectionWithWallet();
		try {
			this._setLoading(true);
			const wallet = await accountStore.getWallet();
			if (wallet == null || this.contracts == null) return;
			const fee = await oracleStore.getPythFee();
			if (oracleStore.updateData == null || fee == null) return;
			const { transactionResult } = await this.contracts.vaultContract.functions
				.withdraw_collateral(amount.toString(), oracleStore.updateData)
				.callParams({
					forward: { amount: fee, assetId: TOKENS_BY_SYMBOL.ETH.assetId },
				})
				.addContracts([
					this.contracts.vaultContract,
					this.contracts.pythContract,
					this.contracts.accountBalanceContract,
					this.contracts.proxyContract,
					this.contracts.clearingHouseContract,
				])
				.txParams({ gasPrice: 1 })
				.call();
			if (transactionResult != null) {
				const formattedAmount = BN.formatUnits(amount, TOKENS_BY_SYMBOL.USDC.decimals).toFormat(2);
				this.notifyThatActionIsSuccessful(`You have successfully ${formattedAmount} withdrawn USDC`);
			}
			await sleep(3000);
			await this.rootStore.accountStore.updateAccountBalances();
			const newCollBalance = await getUserFreeCollateral(this.rootStore.accountStore.indexerAddress);
			this.setFreeCollateral(newCollBalance);
		} catch (e) {
			console.log(e);
			this.notifyError("Error", e?.toString());
		} finally {
			this._setLoading(false);
		}
	};

	notifyThatActionIsSuccessful = (title: string, txId?: string) => {
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

	syncUserDataFromIndexer = async () => {
		const address = this.rootStore.accountStore.indexerAddress;
		const res = await Promise.all([
			getUserPositions(address),
			getUserPerpOrders(address),
			getUserFreeCollateral(address),
		]);
		this.setPosition(res[0]);
		this.setPerpUserOrders(res[1]);
		this.setFreeCollateral(res[2]);
	};
	syncDataFromIndexer = async () => {
		const res = await Promise.all([getPerpMarkets(), getPerpMarketPrices(), getPerpOrders(), getPerpTrades()]);
		this.setPerpMarkets(res[0]);
		this.setPerpPrices(res[1]);
		this.setPerpOrders(res[2]);
		this.setPerpTrades(res[3]);
	};
}

export default TradeStore;
