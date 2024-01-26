import React, { PropsWithChildren, useMemo } from "react";
import { makeAutoObservable } from "mobx";

import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { SpotMarketTrade } from "@src/entity";
import useVM from "@src/hooks/useVM";
import { fetchTrades } from "@src/services/SpotMarketService";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<SpotTradesVM | null>(null);

export const SpotTradesVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SpotTradesVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useSpotTradesVM = () => useVM(ctx);

const UPDATE_INTERVAL = 10 * 1000;

class SpotTradesVM {
  public trades: Array<SpotMarketTrade> = [];

  private tradesUpdater: IntervalUpdater;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    this.updateTrades().then();

    this.tradesUpdater = new IntervalUpdater(this.updateTrades, UPDATE_INTERVAL);

    this.tradesUpdater.run();
  }

  updateTrades = async () => {
    const { tradeStore, initialized } = this.rootStore;

    const market = tradeStore.market;

    if (!initialized || !market) return;

    try {
      const data = await fetchTrades(market.baseToken.assetId, 40);

      // todo: to think about TokenStore
      const token = TOKENS_BY_ASSET_ID[market.baseToken.assetId];

      this.trades = data.map((t) => new SpotMarketTrade({ ...t, baseToken: token }));
    } catch (error) {
      console.error("Error with loading trades");
    }
  };
}
