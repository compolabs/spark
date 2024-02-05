import React, { PropsWithChildren, useMemo } from "react";
import { ethers } from "ethers";
import { makeAutoObservable, reaction, when } from "mobx";

import { SPOT_MARKET_ABI } from "@src/abi";
import { CONTRACT_ADDRESSES } from "@src/constants";
import { SpotMarketOrder } from "@src/entity";
import useVM from "@src/hooks/useVM";
import { fetchOrders } from "@src/services/SpotMarketService";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<BottomTablesInterfaceSpotVM | null>(null);

export const BottomTablesInterfaceSpotVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new BottomTablesInterfaceSpotVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useBottomTablesInterfaceSpotVM = () => useVM(ctx);

class BottomTablesInterfaceSpotVM {
  myOrders: SpotMarketOrder[] = [];
  initialized: boolean = false;

  isOrderCancelling = false;

  private readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    when(
      () => !!this.rootStore.tradeStore.market,
      () => this.sync().then(() => this.setInitialized(true)),
    );
    setInterval(this.sync, 10000);
    reaction(() => this.rootStore.accountStore.address, this.sync);
  }

  cancelOrder = async (orderId: string) => {
    const { accountStore } = this.rootStore;

    if (!accountStore.signer || !this.rootStore.tradeStore.market) return;

    this.isOrderCancelling = true;

    const contract = new ethers.Contract(CONTRACT_ADDRESSES.spotMarket, SPOT_MARKET_ABI, accountStore.signer);
    const transaction = await contract.removeOrder(orderId);
    await transaction.wait();

    this.isOrderCancelling = false;
  };

  private sync = async () => {
    const { accountStore, tradeStore } = this.rootStore;
    if (!tradeStore.market || !accountStore.address) return;
    //todo запрашивать только активные заказы
    return fetchOrders({ baseToken: tradeStore.market.baseToken.assetId, limit: 100, trader: accountStore.address })
      .then(this.setMySpotOrders)
      .catch(console.error);
  };

  private setMySpotOrders = (myOrders: SpotMarketOrder[]) => (this.myOrders = myOrders);

  private setInitialized = (l: boolean) => (this.initialized = l);
}
