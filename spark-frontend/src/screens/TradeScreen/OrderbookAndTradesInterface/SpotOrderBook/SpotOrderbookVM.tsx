import React, { useMemo } from "react";
import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import { SpotMarketOrder } from "@src/entity";
import useVM from "@src/hooks/useVM";
import { fetchOrders } from "@src/services/SpotMarketService";
import BN from "@src/utils/BN";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<SpotOrderbookVM | null>(null);

interface IProps {
  children: React.ReactNode;
}

export const SpotOrderbookVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SpotOrderbookVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSpotOrderbookVM = () => useVM(ctx);

type TOrderbookData = {
  buy: Array<SpotMarketOrder>;
  sell: Array<SpotMarketOrder>;
  spreadPercent: string;
  spreadPrice: string;
};

const UPDATE_INTERVAL = 10 * 1000;

class SpotOrderbookVM {
  rootStore: RootStore;

  orderbook: TOrderbookData = {
    buy: [],
    sell: [],
    spreadPercent: "0.00",
    spreadPrice: "",
  };
  decimalKey: string = "0";
  orderFilter: number = 0;
  amountOfOrders: number = 0;

  private orderBookUpdater: IntervalUpdater;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    reaction(
      () => rootStore.initialized,
      (initialized) => {
        if (!initialized) return;

        this.orderBookUpdater.update();
      },
    );

    this.orderBookUpdater = new IntervalUpdater(this.updateOrderBook, UPDATE_INTERVAL);

    this.orderBookUpdater.run(true);
  }

  get oneSizeOrders() {
    return +new BN(this.amountOfOrders).div(2).toFixed(0) - 1;
  }

  get buyOrders() {
    return this.orderbook.buy
      .slice()
      .sort((a, b) => {
        if (a.price === null && b.price === null) return 0;
        if (a.price === null && b.price !== null) return 1;
        if (a.price === null && b.price === null) return -1;
        return a.price.lt(b.price) ? 1 : -1;
      })
      .reverse()
      .slice(this.orderFilter === 0 ? -this.oneSizeOrders : -this.amountOfOrders)
      .reverse();
  }

  get sellOrders() {
    return this.orderbook.sell
      .slice()
      .sort((a, b) => {
        if (a.price === null && b.price === null) return 0;
        if (a.price === null && b.price !== null) return 1;
        if (a.price === null && b.price === null) return -1;
        return a.price.lt(b.price) ? 1 : -1;
      })
      .slice(this.orderFilter === 0 ? -this.oneSizeOrders : -this.amountOfOrders);
  }

  get totalBuy() {
    return this.buyOrders.reduce((acc, order) => acc.plus(order.quoteSize), BN.ZERO);
  }

  get totalSell() {
    return this.sellOrders.reduce((acc, order) => acc.plus(order.baseSize), BN.ZERO);
  }

  calcSize = (isMobile: boolean) => {
    const orderbookHeight = isMobile ? 380 : window.innerHeight - 260;
    const rowHeight = 17;
    this.setAmountOfOrders(Math.floor((orderbookHeight - 24) / rowHeight));
  };

  setAmountOfOrders = (value: number) => (this.amountOfOrders = value);

  setDecimalKey = (value: string) => (this.decimalKey = value);

  setOrderFilter = (value: number) => (this.orderFilter = value);

  updateOrderBook = async () => {
    const market = this.rootStore.tradeStore.market;
    if (!this.rootStore.initialized || !market) return;

    const [buy, sell] = await Promise.all([
      fetchOrders({ baseToken: market.baseToken.assetId, type: "BUY", limit: 20 }),
      fetchOrders({ baseToken: market.baseToken.assetId, type: "SELL", limit: 20 }),
    ]);

    //bid = max of buy
    const maxBuyPriceOrder = buy.reduce((max: Nullable<SpotMarketOrder>, current) => {
      return current.price.gt(max?.price ?? 0) ? current : max;
    }, null);

    //ask = min of sell
    const minSellPriceOrder = sell.reduce((min: Nullable<SpotMarketOrder>, current) => {
      return min === null || current.price < min.price ? current : min;
    }, null);

    if (maxBuyPriceOrder && minSellPriceOrder) {
      // spread = ask - bid
      const spread = minSellPriceOrder.price.minus(maxBuyPriceOrder.price);
      const formattedSpread = BN.formatUnits(spread, maxBuyPriceOrder.priceDecimals).toFormat(2);

      const spreadPercent = minSellPriceOrder.price
        .minus(maxBuyPriceOrder.price)
        .div(maxBuyPriceOrder.price)
        .times(100);
      this.setOrderbook({ buy, sell, spreadPercent: spreadPercent.toFormat(2), spreadPrice: formattedSpread });
      return;
    }

    this.setOrderbook({ buy, sell, spreadPercent: "0.00", spreadPrice: "0.00" });
  };

  private setOrderbook = (orderbook: TOrderbookData) => (this.orderbook = orderbook);
}
