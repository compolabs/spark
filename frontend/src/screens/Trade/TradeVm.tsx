import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";

const ctx = React.createContext<TradeVm | null>(null);

interface IProps {
  children: React.ReactNode;
}

export const TradeVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new TradeVm(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useTradeVM = () => useVM(ctx);

class TradeVm {
  public rootStore: RootStore;

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  assetId0: string = TOKENS_BY_SYMBOL.ETH.assetId;
  setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

  assetId1: string = TOKENS_BY_SYMBOL.USDC.assetId;
  setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

  amount0: BN = BN.ZERO;
  setAmount0 = (amount: BN) => (this.amount0 = amount);

  amount1: BN = BN.ZERO;
  setAmount1 = (amount: BN) => (this.amount1 = amount);

  get token0() {
    return TOKENS_BY_ASSET_ID[this.assetId0];
  }

  get token1() {
    return TOKENS_BY_ASSET_ID[this.assetId1];
  }

  searchValue = "";
  setSearchValue = (v: string) => (this.searchValue = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
}
