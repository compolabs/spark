import { EvmPriceServiceConnection, Price, PriceFeed } from "@pythnetwork/pyth-evm-js";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { TOKENS_LIST } from "@src/constants";
import BN from "@src/utils/BN";
import RootStore from "@stores/RootStore";

class OracleStore {
  public rootStore: RootStore;

  pythClient: Nullable<EvmPriceServiceConnection> = null;
  private setPythClient = (l: any) => (this.pythClient = l);

  prices: Nullable<Record<string, Price>> = null;
  private setPrices = (v: Record<string, Price>) => (this.prices = v);

  initialized: boolean = false;
  private setInitialized = (l: boolean) => (this.initialized = l);

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    this.initAndGetPythPrices().then(() => this.setInitialized(true));
  }

  initAndGetPythPrices = async () => {
    const pythURL = "https://hermes.pyth.network";
    const connection = new EvmPriceServiceConnection(pythURL, {
      logger: {
        error: console.error,
        warn: console.warn,
        info: () => undefined,
        debug: () => undefined,
        trace: () => undefined,
      },
    });
    this.setPythClient(connection);
    // You can find the ids of prices at https://pyth.network/developers/price-feed-ids

    const priceIds = TOKENS_LIST.filter((t) => t.priceFeed).map((t) => t.priceFeed);

    const res = await connection.getLatestPriceFeeds(priceIds);

    const initPrices = res?.reduce((acc, priceFeed) => {
      const price = priceFeed.getPriceUnchecked();
      return { ...acc, [`0x${priceFeed.id}`]: price };
    }, {} as any);
    this.setPrices(initPrices);

    await connection.subscribePriceFeedUpdates(priceIds, (priceFeed: PriceFeed) => {
      const price = priceFeed.getPriceUnchecked();
      this.setPrices({ ...this.prices, [`0x${priceFeed.id}`]: price });
    });
  };

  getTokenIndexPrice(priceFeed: string): BN {
    if (!this.prices) return BN.ZERO;

    const feed = this.prices[priceFeed];
    const token = TOKENS_LIST.find((t) => t.priceFeed === priceFeed);

    if (!feed?.price) return BN.ZERO;

    const price = new BN(feed.price);

    // Нам нужно докидывать 1 decimal, потому что decimals,
    //   который приходит из оракула не совпадает с нашим
    if (token?.symbol === "BTC") {
      return BN.parseUnits(price, 1);
    }

    return price;
  }

  get tokenIndexPrice(): BN {
    const { market } = this.rootStore.tradeStore;
    const token = market?.baseToken;

    if (!token) return BN.ZERO;

    return this.getTokenIndexPrice(token?.priceFeed);
  }
}

export default OracleStore;
