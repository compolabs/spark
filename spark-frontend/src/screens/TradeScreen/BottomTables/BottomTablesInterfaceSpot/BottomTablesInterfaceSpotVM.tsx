import React, { PropsWithChildren, useMemo } from "react";
import { Dayjs } from "dayjs";
import { makeAutoObservable, reaction, when } from "mobx";

import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { SpotMarketOrder, SpotMarketTrade } from "@src/entity";
import useVM from "@src/hooks/useVM";
import { fetchOrders, fetchTrades } from "@src/services/SpotMarketService";
import { handleEvmErrors } from "@src/utils/handleEvmErrors";
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
  myOrdersHistory: SpotMarketTrade[] = [];
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

    reaction(
      () => this.rootStore.accountStore.isConnected,
      (isConnected) => {
        if (!isConnected) {
          this.setMySpotOrders([]);
        }
      },
    );
  }

  cancelOrder = async (orderId: string) => {
    const { accountStore, notificationStore } = this.rootStore;

    if (!this.rootStore.tradeStore.market) return;

    this.isOrderCancelling = true;

    try {
      await accountStore.blockchain?.cancelOrder(orderId);
      notificationStore.toast("Order canceled!", { type: "success" });
    } catch (error) {
      handleEvmErrors(notificationStore, error, "We were unable to cancel your order at this time");
    }

    this.isOrderCancelling = false;
  };

  private sync = async () => {
    const { accountStore, tradeStore } = this.rootStore;

    if (!tradeStore.market || !accountStore.address) return;

    const { market } = tradeStore;

    const sortDesc = (a: { timestamp: Dayjs }, b: { timestamp: Dayjs }) =>
      b.timestamp.valueOf() - a.timestamp.valueOf();

    try {
      const ordersData = await fetchOrders({
        baseToken: market.baseToken.assetId,
        limit: 100,
        trader: accountStore.address,
        isActive: true,
      });

      const sortedOrder = ordersData.sort(sortDesc);
      this.setMySpotOrders(sortedOrder);

      const token = TOKENS_BY_ASSET_ID[market.baseToken.assetId];
      const ordersHistoryData = await fetchTrades(market.baseToken.assetId, 100, accountStore.address);
      const ordersHistory = ordersHistoryData.map(
        (t) => new SpotMarketTrade({ ...t, baseToken: token, userAddress: accountStore.address! }),
      );

      const sortedOrdersHistory = ordersHistory.sort(sortDesc);
      this.setMySpotOrdersHistory(sortedOrdersHistory);
    } catch (error) {
      console.error(error);
    }
  };

  private setMySpotOrders = (myOrders: SpotMarketOrder[]) => (this.myOrders = myOrders);

  private setMySpotOrdersHistory = (myOrdersHistory: SpotMarketTrade[]) => (this.myOrdersHistory = myOrdersHistory);

  private setInitialized = (l: boolean) => (this.initialized = l);
}
