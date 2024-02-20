import { makeAutoObservable } from "mobx";

import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import { SpotMarket } from "@src/entity";
import { fetchMarketCreateEvents, fetchVolumeData, SpotMarketVolume } from "@src/services/SpotMarketService";
import BN from "@src/utils/BN";
import RootStore from "@stores/RootStore";

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

  volume: SpotMarketVolume = {
    volume: BN.ZERO,
    high: BN.ZERO,
    low: BN.ZERO,
  };

  constructor(rootStore: RootStore, initState?: ISerializedTradeStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    if (initState) {
      const favMarkets = initState.favMarkets?.split(",").filter(Boolean);
      favMarkets && this.setFavMarkets(favMarkets);
    }

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
      return markets
        .filter((market) => TOKENS_BY_ASSET_ID[market.assetId] !== undefined)
        .map((market) => new SpotMarket(market.assetId, TOKENS_BY_SYMBOL.USDC.assetId));
    });

    await Promise.all([fetchSpotMarketsPromise]).then(([spotMarkets]) => {
      this.setSpotMarkets(spotMarkets);
      this._setLoading(false);
      this.setInitialized(true);
      //todo обновлять цену надо тут, не стоит делать setInterval внутри класса SpotMarket
      this.spotMarkets.forEach((market) => {
        market.fetchPrice();
        setInterval(market.fetchPrice, 10000);
      });
    });

    this.volume = await fetchVolumeData();
  };

  private setFavMarkets = (v: string[]) => (this.favMarkets = v);

  private setSpotMarkets = (v: SpotMarket[]) => (this.spotMarkets = v);

  private setInitialized = (l: boolean) => (this.initialized = l);

  private _setLoading = (l: boolean) => (this.loading = l);

  serialize = (): ISerializedTradeStore => ({
    favMarkets: this.favMarkets.join(","),
  });
}

export default TradeStore;
