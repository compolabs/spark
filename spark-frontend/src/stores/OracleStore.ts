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
    console.log(res);

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

    const price = this.prices[priceFeed];
    const v = BN.formatUnits(price?.price, 2);

    return price?.price ? v : BN.ZERO;
  }

  get tokenIndexPrice(): BN {
    const { market } = this.rootStore.tradeStore;
    const token = market?.baseToken;

    if (!token) return BN.ZERO;

    return this.getTokenIndexPrice(token?.priceFeed);
  }
}

export default OracleStore;
