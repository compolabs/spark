import React, { PropsWithChildren, useMemo } from "react";
import { makeAutoObservable } from "mobx";

import useVM from "@src/hooks/useVM";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<ChartVM | null>(null);

export const ChartVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new ChartVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useChartVM = () => useVM(ctx);

class ChartVM {
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }
}
