import React, { PropsWithChildren, useMemo } from "react";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import useVM from "@src/hooks/useVM";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<PerpTableVM | null>(null);

export const PerpTableVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new PerpTableVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const usePerpTableVMProvider = () => useVM(ctx);

class PerpTableVM {
  myPositions: any[] = [
    {
      pair: "ETH-USDC",
      type: "LONG",
      leverage: "20",
      baseToken: "ETH",
      quoteToken: "USDC",
      size: "0.89",
      value: "1719.21",
      margin: "75.6255",
      entry: "1720.33",
      mark: "1789.33",
      liqPrice: "1720.23",
      unrealizedPnl: "64.1677",
      unrealizedPnlPercent: "85.25%",
      fundingPayment: "78.1233",
      isTpSlActive: true,
      takeProfit: "0.0001",
      stopLoss: "0.0002",
    },
  ];

  cancelingOrderId: Nullable<string> = null;

  private readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  cancelOrder = async (positionId: string) => {};
}
