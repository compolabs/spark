import { makeAutoObservable, reaction } from "mobx";

import { SpotMarketVolume } from "@src/blockchain/types";
import { PerpMarket, SpotMarket } from "@src/entity";
import BN from "@src/utils/BN";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";
import RootStore from "@stores/RootStore";

export interface ISerializedTradeStore {
  favMarkets: string | null;
}

const MARKET_INFO_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 min
const MARKET_PRICES_UPDATE_INTERVAL = 10 * 1000; // 10 sec

class TradeStore {
  rootStore: RootStore;
  initialized: boolean = false;
  loading: boolean = false;
  favMarkets: string[] = [];
  spotMarkets: SpotMarket[] = [];
  perpMarkets: PerpMarket[] = [];
  marketSelectionOpened: boolean = false;
  marketSymbol: string | null = null;
  readonly defaultMarketSymbol = "BTC-USDC";

  isPerp = false;
  setIsPerp = (value: boolean) => (this.isPerp = value);

  marketInfo: SpotMarketVolume = {
    volume: BN.ZERO,
    high: BN.ZERO,
    low: BN.ZERO,
  };

  private marketInfoUpdater: IntervalUpdater;
  private marketPricesUpdater: IntervalUpdater;

  constructor(rootStore: RootStore, initState?: ISerializedTradeStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    if (initState) {
      const favMarkets = initState.favMarkets?.split(",").filter(Boolean);
      favMarkets && this.setFavMarkets(favMarkets);
    }

    this.init();

    const { blockchainStore } = this.rootStore;

    reaction(
      () => blockchainStore.currentInstance?.NETWORK_TYPE,
      async () => {
        this.setSpotMarkets([]);
        this.init();
      },
    );

    this.marketInfoUpdater = new IntervalUpdater(this.updateMarketInfo, MARKET_INFO_UPDATE_INTERVAL);
    this.marketPricesUpdater = new IntervalUpdater(this.updateMarketPrices, MARKET_PRICES_UPDATE_INTERVAL);

    this.marketInfoUpdater.run(true);
    this.marketPricesUpdater.run();
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
    const { blockchainStore } = this.rootStore;

    const bcNetwork = blockchainStore.currentInstance;

    this.marketInfo = await bcNetwork!.fetchVolume();
  };

  updateMarketPrices = async () => {
    const { blockchainStore } = this.rootStore;

    const bcNetwork = blockchainStore.currentInstance;

    const spotMarketPriceUpdates = this.spotMarkets.map((market) =>
      bcNetwork!.fetchMarketPrice(market.baseToken.assetId),
    );

    await Promise.all(spotMarketPriceUpdates);
  };

  serialize = (): ISerializedTradeStore => ({
    favMarkets: this.favMarkets.join(","),
  });

  private init = async () => {
    this.loading = true;

    const { blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    try {
      console.log(bcNetwork);
      const markets = await bcNetwork!.fetchMarkets(100);
      const spotMarkets = markets
        .filter((market) => bcNetwork!.getTokenByAssetId(market.assetId) !== undefined)
        .map((market) => new SpotMarket(market.assetId, bcNetwork!.getTokenBySymbol("USDC").assetId));

      this.setSpotMarkets(spotMarkets);
      this.setPerpMarkets([
        new PerpMarket(bcNetwork!.getTokenBySymbol("BTC").assetId, bcNetwork!.getTokenBySymbol("USDC").assetId),
      ]);

      await this.updateMarketPrices();
    } catch (error) {
      console.error("Error with init of trade store", error);
    }

    this._setLoading(false);
    this.setInitialized(true);
  };

  private setFavMarkets = (v: string[]) => (this.favMarkets = v);

  private setSpotMarkets = (v: SpotMarket[]) => (this.spotMarkets = v);

  private setPerpMarkets = (v: PerpMarket[]) => (this.perpMarkets = v);

  private setInitialized = (l: boolean) => (this.initialized = l);

  private _setLoading = (l: boolean) => (this.loading = l);
}

export default TradeStore;
