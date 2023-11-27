import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
import { IToken, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";

export interface IMarket {
	token0: IToken;
	token1: IToken;
	type: string;
	leverage?: number;
	price?: BN;
	change24?: BN;
	symbol: string;
}

interface IFavMarket {
	symbol: string;
	type: string;
}

export interface ISerializedTradeStore {
	favMarkets: string | null;
}

const spotMarketsConfig = [
	{ token0: TOKENS_BY_SYMBOL.UNI, token1: TOKENS_BY_SYMBOL.USDC },
	{
		token0: TOKENS_BY_SYMBOL.BTC,
		token1: TOKENS_BY_SYMBOL.ETH,
	},
].map((v) => ({
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

	marketSymbol: string | null = null;
	setMarketSymbol = (v: string) => (this.marketSymbol = v);

	marketsConfig: Record<string, IMarket> = [...spotMarketsConfig, ...perpMarketsConfig].reduce(
		(acc, item) => {
			acc[item.symbol] = item;
			return acc;
		},
		{} as Record<string, IMarket>,
	);

	spotMarkets: IMarket[] = [];
	private setSpotMarkets = (v: IMarket[]) => (this.spotMarkets = v);

	perpMarkets: IMarket[] = [];
	private setPerpMarkets = (v: IMarket[]) => (this.perpMarkets = v);

	favMarkets: string[] = [];
	private setFavMarkets = (v: string[]) => (this.favMarkets = v);

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
}

export default TradeStore;
