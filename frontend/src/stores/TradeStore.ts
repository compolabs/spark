import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
import { CONTRACT_ADDRESSES, IToken, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import { ClearingHouseAbi__factory, VaultAbi__factory } from "@src/contracts";
import { log } from "fuels/dist/cli/utils/logger";

export interface IMarket {
	token0: IToken;
	token1: IToken;
	type: string;
	leverage?: number;
	price?: BN;
	change24?: BN;
	symbol: string;
}

//todo implement service for getting markets stats
//todo implement service file for getting data from indexer
export interface ISerializedTradeStore {
	favMarkets: string | null;
}

const spotMarketsConfig = [{ token0: TOKENS_BY_SYMBOL.UNI, token1: TOKENS_BY_SYMBOL.USDC }].map((v) => ({
	...v,
	symbol: `${v.token0.symbol}-${v.token1.symbol}`,
	type: "spot",
	price: new BN(10000),
	change24: new BN(10000),
}));
const perpMarketsConfig = [
	{ token0: TOKENS_BY_SYMBOL.BTC, token1: TOKENS_BY_SYMBOL.USDC, leverage: 10 },
	{ token0: TOKENS_BY_SYMBOL.ETH, token1: TOKENS_BY_SYMBOL.USDC, leverage: 10 },
	{ token0: TOKENS_BY_SYMBOL.UNI, token1: TOKENS_BY_SYMBOL.USDC, leverage: 10 },
].map((v) => ({
	...v,
	symbol: `${v.token0.symbol}-PERP`,
	type: "perp",
	price: new BN(10000),
	change24: new BN(10000),
}));

class TradeStore {
	public rootStore: RootStore;

	constructor(rootStore: RootStore, initState?: ISerializedTradeStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
		this.setSpotMarkets(spotMarketsConfig);
		this.setPerpMarkets(perpMarketsConfig);

		if (initState != null) {
			const markets = initState.favMarkets ?? "";
			this.setFavMarkets(markets.split(","));
		}
	}

	freeCollateral: BN | null = null;
	setFreeCollateral = (v: BN | null) => (this.freeCollateral = v);

	marketSymbol: string | null = null;
	setMarketSymbol = (v: string) => (this.marketSymbol = v);

	marketsConfig: Record<string, IMarket> = [...spotMarketsConfig, ...perpMarketsConfig].reduce(
		(acc, item) => {
			acc[item.symbol] = item;
			return acc;
		},
		{} as Record<string, IMarket>,
	);
	loading: boolean = false;
	private _setLoading = (l: boolean) => (this.loading = l);

	spotMarkets: IMarket[] = [];
	private setSpotMarkets = (v: IMarket[]) => (this.spotMarkets = v);

	perpMarkets: IMarket[] = [];
	private setPerpMarkets = (v: IMarket[]) => (this.perpMarkets = v);

	favMarkets: string[] = [];
	private setFavMarkets = (v: string[]) => (this.favMarkets = v);

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
		return this.marketSymbol == null ? false : this.marketsConfig[this.marketSymbol].type === "perp";
	}

	marketSelectionOpened: boolean = false;
	setMarketSelectionOpened = (s: boolean) => (this.marketSelectionOpened = s);

	deposit = async (amount: BN) => {
		const { accountStore } = this.rootStore;
		const amountDep = BN.parseUnits(5, TOKENS_BY_SYMBOL.USDC.decimals);
		await accountStore.checkConnectionWithWallet();
		try {
			this._setLoading(true);
			const vault = CONTRACT_ADDRESSES.vault;
			const wallet = await accountStore.getWallet();
			if (wallet == null) return;
			const vaultContract = VaultAbi__factory.connect(vault, wallet);

			const { transactionResult } = await vaultContract.functions
				.deposit_collateral()
				.callParams({
					forward: { amount: amountDep.toString(), assetId: TOKENS_BY_SYMBOL.USDC.assetId },
				})
				.txParams({ gasPrice: 1 })
				.call();
			console.log("transactionResult", transactionResult);
			if (transactionResult != null) {
				this.notifyThatActionIsSuccessful(`You have successfully deposited USDC`);
			}
			await this.rootStore.accountStore.updateAccountBalances();
		} catch (e) {
			const errorText = e?.toString();
			console.log(errorText);
			this.notifyError(errorText ?? "", { type: "error" });
		} finally {
			this._setLoading(false);
		}
	};
	openOrder = async () => {
		const { accountStore, oracleStore } = this.rootStore;
		await accountStore.checkConnectionWithWallet();
		try {
			this._setLoading(true);
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
			this._setLoading(false);
		}
	};
	withdraw = async () => {
		//todo check if user has enought of USDC
		const { accountStore, oracleStore } = this.rootStore;
		await accountStore.checkConnectionWithWallet();
		const amount = BN.parseUnits(5, TOKENS_BY_SYMBOL.USDC.decimals);
		try {
			this._setLoading(true);
			const vault = CONTRACT_ADDRESSES.vault;
			const wallet = await accountStore.getWallet();
			if (wallet == null) return;
			const vaultContract = VaultAbi__factory.connect(vault, wallet);
			//todo make request to pyth
			const btcToken = TOKENS_BY_SYMBOL.BTC;
			if (oracleStore.updateData == null) return;
			console.log(oracleStore.updateData);

			const { transactionResult } = await vaultContract.functions
				.withdraw_collateral(amount.toString(), oracleStore.updateData)
				.txParams({ gasPrice: 1 })
				.call();
			if (transactionResult != null) {
				this.notifyThatActionIsSuccessful(`You have successfully deposited USDC`);
			}
			await this.rootStore.accountStore.updateAccountBalances();
		} catch (e) {
			console.log(e);
		} finally {
			this._setLoading(false);
		}
	};

	/////////////get values
	getFreeCollateral = async () => {
		this.setFreeCollateral(BN.ZERO);
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
}

export default TradeStore;
