import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
} from "@src/constants";
import BN from "@src/utils/BN";
import { LimitOrdersAbi__factory } from "@src/contracts";
import { getLatestTradesInPair, Trade } from "@src/services/TradesService";

const ctx = React.createContext<TradeVm | null>(null);

interface IProps {
  children: React.ReactNode;
}

export const TradeVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new TradeVm(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

type OrderAction = "buy" | "sell";

export const useTradeVM = () => useVM(ctx);

class TradeVm {
  public rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.getLatestTrades().then();
    reaction(
      () => [this.assetId0, this.assetId1],
      () => this.getLatestTrades()
    );
  }

  getLatestTrades = async () => {
    const data = await getLatestTradesInPair(`${this.token0.symbol}/${this.token1.symbol}`);
    this.setTrades(data);
  };
  loading: boolean = false;
  private setLoading = (l: boolean) => (this.loading = l);

  trades: Array<Trade> = [];
  setTrades = (v: Array<Trade>) => (this.trades = v);

  get latestTrade() {
    if (this.trades.length === 0) return null;
    return this.trades[0];
  }

  activeModalAction: 0 | 1 = 0;
  setActiveModalAction = (v: 0 | 1) => (this.activeModalAction = v);

  assetId0: string = TOKENS_BY_SYMBOL.BTC.assetId;
  setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

  assetId1: string = TOKENS_BY_SYMBOL.USDC.assetId;
  setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

  rejectUpdateStatePromise?: () => void;
  setRejectUpdateStatePromise = (v: any) => (this.rejectUpdateStatePromise = v);

  get token0() {
    return TOKENS_BY_ASSET_ID[this.assetId0];
  }

  get token1() {
    return TOKENS_BY_ASSET_ID[this.assetId1];
  }

  searchValue = "";
  setSearchValue = (v: string) => (this.searchValue = v);

  buyPrice: BN = BN.ZERO;
  setBuyPrice = (price: BN, sync?: boolean) => {
    this.buyPrice = price;
    if (this.buyAmount.gt(0) && price.gt(0) && sync) {
      const v1 = BN.formatUnits(price, this.token1.decimals);
      const v2 = BN.formatUnits(this.buyAmount, this.token0.decimals);
      this.setBuyTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
    }
  };

  buyAmount: BN = BN.ZERO;
  setBuyAmount = (amount: BN, sync?: boolean) => {
    this.buyAmount = amount;
    if (this.buyPrice.gt(0) && amount.gt(0) && sync) {
      const v1 = BN.formatUnits(this.buyPrice, this.token1.decimals);
      const v2 = BN.formatUnits(amount, this.token0.decimals);
      this.setBuyTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
    }
  };

  buyTotal: BN = BN.ZERO;
  setBuyTotal = (total: BN, sync?: boolean) => {
    this.buyTotal = total;
    if (this.buyAmount.gt(0) && this.buyPrice.gt(0) && sync) {
      const v1 = BN.formatUnits(this.buyPrice, this.token1.decimals);
      const v2 = BN.formatUnits(total, this.token1.decimals);
      this.setBuyAmount(BN.parseUnits(v2.div(v1), this.token0.decimals));
    }
  };

  sellPrice: BN = BN.ZERO;
  setSellPrice = (price: BN, sync?: boolean) => {
    this.sellPrice = price;
    if (this.sellAmount.gt(0) && price.gt(0) && sync) {
      const v1 = BN.formatUnits(price, this.token1.decimals);
      const v2 = BN.formatUnits(this.sellAmount, this.token0.decimals);
      this.setSellTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
    }
  };

  sellAmount: BN = BN.ZERO;
  setSellAmount = (amount: BN, sync?: boolean) => {
    this.sellAmount = amount;
    if (this.sellPrice.gt(0) && amount.gt(0) && sync) {
      const v1 = BN.formatUnits(this.sellPrice, this.token1.decimals);
      const v2 = BN.formatUnits(amount, this.token0.decimals);
      this.setSellTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
    }
  };

  sellTotal: BN = BN.ZERO;
  setSellTotal = (total: BN, sync?: boolean) => {
    this.sellTotal = total;
    if (this.sellAmount.gt(0) && this.sellPrice.gt(0) && sync) {
      const v1 = BN.formatUnits(this.sellPrice, this.token1.decimals);
      const v2 = BN.formatUnits(total, this.token1.decimals);
      this.setSellAmount(BN.parseUnits(v2.div(v1), this.token0.decimals));
    }
  };

  get canBuy() {
    return (
      this.buyAmount.gt(0) && this.buyPrice.gt(0) && this.buyTotal.gt(0) && !this.buyTotalError
    );
  }

  get canSell() {
    return (
      this.sellAmount.gt(0) && this.sellPrice.gt(0) && this.sellTotal.gt(0) && !this.sellAmountError
    );
  }

  get matcherFee() {
    return "1000";
  }

  createOrder = async (action: OrderAction) => {
    const { accountStore } = this.rootStore;
    if (accountStore.address == null) return;
    const wallet = await accountStore.getWallet();
    if (wallet == null) return;
    const limitOrdersContract = LimitOrdersAbi__factory.connect(
      CONTRACT_ADDRESSES.limitOrders,
      wallet
    );
    if (limitOrdersContract == null) return;
    let token0 = null;
    let token1 = null;
    let amount0 = null;
    let amount1 = null;
    if (action === "buy") {
      token0 = this.assetId1;
      token1 = this.assetId0;
      amount0 = this.buyTotal.toString();
      amount1 = this.buyAmount.toString();
    }
    if (action === "sell") {
      token0 = this.assetId0;
      token1 = this.assetId1;
      amount0 = this.sellAmount.toFixed(0).toString();
      amount1 = this.sellTotal.toFixed(0).toString();
    }
    if (token0 == null || token1 == null || amount0 == null || amount1 == null) return;

    this.setLoading(true);
    try {
      await limitOrdersContract
        .multiCall([
          limitOrdersContract.functions.deposit().callParams({
            forward: {
              amount: "100000",
              assetId: TOKENS_BY_SYMBOL.ETH.assetId,
            },
          }),
          limitOrdersContract.functions
            .create_order({ value: token1 }, amount1, this.matcherFee)
            .callParams({ forward: { amount: amount0, assetId: token0 } }),
        ])
        .txParams({ gasPrice: 1 })
        .call()
        .then(({ transactionResult }) => {
          transactionResult &&
            this.notifyThatActionIsSuccessful(
              "Order has been placed",
              transactionResult.transactionId ?? ""
            );
        })
        .then(() => this.rootStore.ordersStore.sync());
    } catch (e) {
      const error = JSON.parse(JSON.stringify(e)).toString();
      this.rootStore.notificationStore.toast(error.error, {
        type: "error",
        title: "Oops..",
      });
      console.error(e);
    } finally {
      await this.rootStore.ordersStore.sync();
      this.setLoading(false);
    }
  };

  cancelOrder = async (id: string) => {
    const { accountStore } = this.rootStore;
    if (accountStore.address == null) return;
    const wallet = await accountStore.getWallet();
    if (wallet == null) return;
    const limitOrdersContract = LimitOrdersAbi__factory.connect(
      CONTRACT_ADDRESSES.limitOrders,
      wallet
    );
    if (limitOrdersContract == null) return;

    this.setLoading(true);
    try {
      await limitOrdersContract.functions
        .cancel_order(id)
        .txParams({ gasPrice: 1 })
        .call()
        .then(
          ({ transactionResult }) =>
            transactionResult &&
            this.notifyThatActionIsSuccessful(
              "Order has been canceled",
              transactionResult.transactionId ?? ""
            )
        )
        .then(() => {
          const { myOrders } = this.rootStore.ordersStore;
          const index = myOrders.findIndex((obj) => obj.id === id);
          myOrders.splice(index, 1);
        });
      //todo add update
    } catch (e) {
      this.notifyError(JSON.parse(JSON.stringify(e)).toString(), e);
    } finally {
      this.setLoading(false);
    }
  };

  get buyTotalError(): boolean {
    const { accountStore } = this.rootStore;
    const balance = accountStore.getBalance(this.token1);
    return balance == null ? false : this.buyTotal.gt(balance);
  }

  get sellAmountError(): boolean | undefined {
    const { accountStore } = this.rootStore;
    const balance = accountStore.getBalance(this.token0);
    return balance == null ? false : this.sellAmount.gt(balance);
  }

  notifyThatActionIsSuccessful = (title: string, txId: string) => {
    this.rootStore.notificationStore.toast(title, {
      link: `${EXPLORER_URL}/transaction/${txId}`,
      linkTitle: "View on Explorer",
      type: "success",
      title: "Transaction is completed!",
    });
  };
  notifyError = (title: string, error: any) => {
    console.error(error);
    this.rootStore.notificationStore.toast(title, {
      type: "error",
      title: "Oops...",
    });
  };
}
