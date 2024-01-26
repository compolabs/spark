import React, { useMemo } from "react";
import { makeAutoObservable } from "mobx";

import useVM from "@src/hooks/useVM";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<SpotOrderbookVm | null>(null);

interface IProps {
  children: React.ReactNode;
}

export const OrderbookAndTradesInterfaceVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new SpotOrderbookVm(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useOrderbookAndTradesInterfaceScreenVM = () => useVM(ctx);

//todo удалить если не нужна будет
class SpotOrderbookVm {
  rootStore: RootStore;
  isOrderbook = true;

  // setIsOrderbook = (value: boolean) => (this.isOrderbook = value);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
}
