import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import {
  CONTRACT_ADDRESSES,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
} from "@src/constants";
import BN from "@src/utils/BN";
import { LimitOrdersAbi, LimitOrdersAbi__factory } from "@src/contracts";

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

export interface IOrder {
  id: string;
  amount0: BN;
  token0: string;
  amount1: BN;
  token1: string;
  txId: string;
  fulfilled0: BN;
  fulfilled1: BN;
  timestamp: number;
  status: "active" | "closed" | "canceled";
}

export const useTradeVM = () => useVM(ctx);

class TradeVm {
  public rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.updateState().then(() => this.setInitialized(true));
  }

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  initialized: boolean = false;
  private setInitialized = (l: boolean) => (this.loading = l);

  activeModalAction: 0 | 1 = 0;
  setActiveModalAction = (v: 0 | 1) => (this.activeModalAction = v);

  assetId0: string = TOKENS_BY_SYMBOL.ETH.assetId;
  setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

  assetId1: string = TOKENS_BY_SYMBOL.USDC.assetId;
  setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

  rejectUpdateStatePromise?: () => void;
  setRejectUpdateStatePromise = (v: any) => (this.rejectUpdateStatePromise = v);

  updateState = async () => {
    const { accountStore } = this.rootStore;
    if (accountStore.address == null) return;
    const wallet = accountStore.walletToRead;
    if (wallet == null) return;
    const limitOrdersContract = LimitOrdersAbi__factory.connect(
      CONTRACT_ADDRESSES.limitOrders,
      wallet
    );
    if (this.rejectUpdateStatePromise != null) this.rejectUpdateStatePromise();

    const promise = new Promise((resolve, reject) => {
      this.rejectUpdateStatePromise = reject;
      resolve(Promise.all([this.getDepositByAddress(limitOrdersContract)]));
    });
    promise
      .catch((v) => {
        console.log("update data error", v);
      })
      .finally(() => {
        this.setInitialized(true);
        this.setRejectUpdateStatePromise(undefined);
      });
  };

  getDepositByAddress = async (contract: LimitOrdersAbi) => {
    const { addressInput } = this.rootStore.accountStore;
    if (addressInput == null) return;
    // const value = await contract.functions
    //   .get_deposit_by_address(addressInput)
    //   .get();
  };
  getOrdersByAddress = async (contract: LimitOrdersAbi) => {
    const { addressInput } = this.rootStore.accountStore;
    if (addressInput == null) return;
  };

  get token0() {
    return TOKENS_BY_ASSET_ID[this.assetId0];
  }

  get token1() {
    return TOKENS_BY_ASSET_ID[this.assetId1];
  }

  searchValue = "";
  setSearchValue = (v: string) => (this.searchValue = v);

  deposit = async (limitOrders: LimitOrdersAbi) => {
    return limitOrders.functions
      .deposit()
      .callParams({
        forward: {
          amount: "100000",
          assetId: TOKENS_BY_SYMBOL.ETH.assetId,
        },
      })
      .txParams({ gasPrice: 1 })
      .call();
  };

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
      this.buyAmount.gt(0) &&
      this.buyPrice.gt(0) &&
      this.buyTotal.gt(0) &&
      !this.buyTotalError
    );
  }

  get canSell() {
    return (
      this.sellAmount.gt(0) &&
      this.sellPrice.gt(0) &&
      this.sellTotal.gt(0) &&
      !this.sellAmountError
    );
  }

  get matcherFee() {
    return "1000";
  }

  createOrder = async (action: OrderAction) => {
    const { accountStore } = this.rootStore;
    this._setLoading(true);
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
      token1 = this.assetId1;
      amount0 = this.buyTotal.toString();
      amount1 = this.buyAmount.toString();
    }
    if (action === "sell") {
      token0 = this.assetId1;
      token1 = this.assetId0;
      amount0 = this.buyTotal.toString();
      amount1 = this.buyAmount.toString();
    }
    if (token0 == null || token1 == null || amount0 == null || amount1 == null)
      return;

    try {
      const deposit = await this.deposit(limitOrdersContract);
      console.log(deposit);
      const tx = await limitOrdersContract.functions
        .create_order({ value: token1 }, amount1, this.matcherFee)
        .callParams({ forward: { amount: amount0, assetId: token0 } })
        .txParams({ gasPrice: 1 })
        .call();
      console.log(tx);
    } catch (e) {
      const error = JSON.parse(JSON.stringify(e)).toString();
      this.rootStore.notificationStore.toast(error.error, {
        type: "error",
        title: "Oops..",
      });
      console.error(e);
    } finally {
      this._setLoading(false);
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
}
