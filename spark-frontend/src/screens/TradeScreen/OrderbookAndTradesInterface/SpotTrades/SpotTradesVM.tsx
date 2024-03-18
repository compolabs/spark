import React, { PropsWithChildren, useMemo } from "react";
import { makeAutoObservable } from "mobx";

import { SpotMarketTrade } from "@src/entity";
import useVM from "@src/hooks/useVM";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<SpotTradesVM | null>(null);

export const SpotTradesVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SpotTradesVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSpotTradesVM = () => useVM(ctx);

const UPDATE_TRADES_INTERVAL = 10 * 1000;

class SpotTradesVM {
  public trades: Array<SpotMarketTrade> = [];

  private tradesUpdater: IntervalUpdater;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    this.updateTrades().then();

    this.tradesUpdater = new IntervalUpdater(this.updateTrades, UPDATE_TRADES_INTERVAL);

    this.tradesUpdater.run();
  }

  updateTrades = async () => {
    const { accountStore, tradeStore, initialized, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    const market = tradeStore.market;

    if (!initialized || !market) return;

    try {
      this.trades = await bcNetwork!.fetchTrades({
        baseToken: market.baseToken.assetId,
        limit: 40,
        trader: accountStore.address!,
      });
    } catch (error) {
      console.error("Error with loading trades");
    }
  };
}
