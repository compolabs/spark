import { makeAutoObservable, runInAction } from "mobx";

import { IToken, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import { fetchMarketCreateEvents, fetchMarketPrice } from "@src/services/SpotMarketService";
import BN from "@src/utils/BN";
import RootStore from "@stores/RootStore";

//todo все классы типа этого стоит хранить в отдельной папке
export class SpotMarket {
	baseToken: IToken;
	quoteToken: IToken;
	price: BN = BN.ZERO; //todo брать начальное значение из локалстораджа
	constructor(baseToken: string, quoteToken: string) {
		this.baseToken = TOKENS_BY_ASSET_ID[baseToken];
		this.quoteToken = TOKENS_BY_ASSET_ID[quoteToken];
	}

	get symbol(): string {
		return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
	}

	get priceUnits(): BN {
		return BN.formatUnits(BN.ZERO, 9);
	}

	get change24(): BN {
		return BN.ZERO;
	}

	fetchPrice = async () => {
		try {
			const price = await fetchMarketPrice(this.baseToken.assetId);
			runInAction(() => {
				this.price = price;
			});
		} catch (error) {
			console.error("Ошибка при получении цены:", error);
		}
	};
}

export interface ISerializedTradeStore {
	favMarkets: string | null;
}

class TradeStore {
	rootStore: RootStore;
	initialized: boolean = false;
	loading: boolean = false;
	favMarkets: Array<string> = [];
	spotMarkets: Array<SpotMarket> = [];
	marketSelectionOpened: boolean = false;
	marketSymbol: string | null = null;
	readonly defaultMarketSymbol = "BTC-USDC";

	constructor(rootStore: RootStore, initState?: ISerializedTradeStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
		this.init();
	}

	get market() {
		return this.spotMarkets.find((market) => market.symbol === this.marketSymbol);
	}

	setMarketSymbol = (v: string) => (this.marketSymbol = v);

	addToFav = (marketId: string) => {
		if (!this.favMarkets.includes(marketId)) {
			this.setFavMarkets([...this.favMarkets, marketId]);
		}
	};

	removeFromFav = (marketId: string) => {
		const index = this.favMarkets.indexOf(marketId);
		index !== -1 && this.favMarkets.splice(index, 1);
	};

	setMarketSelectionOpened = (s: boolean) => (this.marketSelectionOpened = s);

	private init = async () => {
		this.loading = true;

		const fetchSpotMarketsPromise = fetchMarketCreateEvents(100).then((markets) => {
			return markets.map((market) => new SpotMarket(market.assetId, TOKENS_BY_SYMBOL.USDC.assetId));
		});

		await Promise.all([fetchSpotMarketsPromise]).then(([spotMarkets]) => {
			this.setSpotMarkets(spotMarkets);
			this._setLoading(false);
			this.setInitialized(true);
			//todo обновлять цену надо тут, не стоит делать setInterval внутри класса SpotMarket
			// this.spotMarkets.forEach((market) => {
			// 	market.fetchPrice();
			// 	setInterval(market.fetchPrice, 10000);
			// }); // Запуск обновлений цены после инициализации
		});
	};

	private setFavMarkets = (v: string[]) => (this.favMarkets = v);

	private setSpotMarkets = (v: SpotMarket[]) => (this.spotMarkets = v);

	private serialize = (): ISerializedTradeStore => ({
		favMarkets: this.favMarkets.join(","),
	});

	private setInitialized = (l: boolean) => (this.initialized = l);

	private _setLoading = (l: boolean) => (this.loading = l);
}

export default TradeStore;
