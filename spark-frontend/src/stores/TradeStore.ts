import { makeAutoObservable } from "mobx";

import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import { SpotMarket } from "@src/entity";
import { fetchMarketCreateEvents, fetchVolumeData, SpotMarketVolume } from "@src/services/SpotMarketService";
import BN from "@src/utils/BN";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";
import RootStore from "@stores/RootStore";

export interface ISerializedTradeStore {
  favMarkets: string | null;
}

const MARKET_INFO_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 min

class TradeStore {
  rootStore: RootStore;
  initialized: boolean = false;
  loading: boolean = false;
  favMarkets: Array<string> = [];
  spotMarkets: Array<SpotMarket> = [];
  marketSelectionOpened: boolean = false;
  marketSymbol: string | null = null;
  readonly defaultMarketSymbol = "BTC-USDC";

  marketInfo: SpotMarketVolume = {
    volume: BN.ZERO,
    high: BN.ZERO,
    low: BN.ZERO,
  };

  private marketInfoUpdater: IntervalUpdater;

  constructor(rootStore: RootStore, initState?: ISerializedTradeStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    if (initState) {
      const favMarkets = initState.favMarkets?.split(",").filter(Boolean);
      favMarkets && this.setFavMarkets(favMarkets);
    }

    this.init();

    this.marketInfoUpdater = new IntervalUpdater(this.updateMarketInfo, MARKET_INFO_UPDATE_INTERVAL);

    this.marketInfoUpdater.run(true);
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

  updateMarketInfo = async () => {
    this.marketInfo = await fetchVolumeData();
  };

  serialize = (): ISerializedTradeStore => ({
    favMarkets: this.favMarkets.join(","),
  });

  private init = async () => {
    this.loading = true;

    const fetchSpotMarketsPromise = fetchMarketCreateEvents(100).then((markets) => {
      return markets
        .filter((market) => TOKENS_BY_ASSET_ID[market.assetId.toLowerCase()] !== undefined)
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
  };

  private setFavMarkets = (v: string[]) => (this.favMarkets = v);

  private setSpotMarkets = (v: SpotMarket[]) => (this.spotMarkets = v);

  private setInitialized = (l: boolean) => (this.initialized = l);

  private _setLoading = (l: boolean) => (this.loading = l);
}

export default TradeStore;
