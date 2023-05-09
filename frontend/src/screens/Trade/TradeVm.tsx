import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  PREDICATE_BUILDER,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
} from "@src/constants";
import BN from "@src/utils/BN";
import { LimitOrdersAbi__factory } from "@src/contracts";
import { getLatestTradesInPair, Trade } from "@src/services/TradesService";
import { CreateOrderScriptAbi__factory } from "@src/scripts";
import { createOrder } from "@src/services/OrdersService";
import { Address } from "fuels";

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
    when(() => this.rootStore.ordersStore.initialized, this.setMarketPrice);
  }

  setMarketPrice = () => {
    const { orderbook } = this.rootStore.ordersStore;
    const buyPrice = BN.parseUnits(
      orderbook.buy[0].price,
      this.token0.decimals
    );
    const sellPrice = BN.parseUnits(
      orderbook.sell[0].price,
      this.token1.decimals
    );
    this.setBuyPrice(sellPrice);
    this.setSellPrice(buyPrice);
  };

  getLatestTrades = async () => {
    const data = await getLatestTradesInPair(
      `${this.token0.symbol}/${this.token1.symbol}`
    );
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
    if (price.eq(0)) this.setBuyTotal(BN.ZERO);
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
      const total = BN.parseUnits(v2.times(v1), this.token1.decimals);
      this.setBuyTotal(total);
      const balance = this.rootStore.accountStore.getBalance(this.token1);
      if (balance == null) return;
      const percent = total.times(100).div(balance);
      this.setBuyPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
    }
  };

  buyPercent: BN = new BN(0);
  setBuyPercent = (value: number | number[]) =>
    (this.buyPercent = new BN(value.toString()));

  buyTotal: BN = BN.ZERO;
  setBuyTotal = (total: BN, sync?: boolean) => {
    this.buyTotal = total;
    if (this.buyPrice.gt(0) && sync) {
      const v1 = BN.formatUnits(this.buyPrice, this.token1.decimals);
      const v2 = BN.formatUnits(total, this.token1.decimals);
      this.setBuyAmount(BN.parseUnits(v2.div(v1), this.token0.decimals));
      //todo add
      const balance = this.rootStore.accountStore.getBalance(this.token1);
      if (balance == null) return;
      const percent = total.times(100).div(balance);
      this.setBuyPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
    }
  };

  sellPrice: BN = BN.ZERO;
  setSellPrice = (price: BN, sync?: boolean) => {
    this.sellPrice = price;
    if (price.eq(0)) this.setSellTotal(BN.ZERO);
    if (this.sellAmount.gt(0) && price.gt(0) && sync) {
      const v1 = BN.formatUnits(price, this.token1.decimals);
      const v2 = BN.formatUnits(this.sellAmount, this.token0.decimals);
      this.setSellTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
    }
  };

  sellAmount: BN = BN.ZERO;
  setSellAmount = (amount: BN, sync?: boolean) => {
    this.sellAmount = amount;
    if (amount.eq(0)) this.setSellTotal(BN.ZERO);
    if (this.sellPrice.gt(0) && amount.gt(0) && sync) {
      const v1 = BN.formatUnits(this.sellPrice, this.token1.decimals);
      const v2 = BN.formatUnits(amount, this.token0.decimals);
      this.setSellTotal(BN.parseUnits(v2.times(v1), this.token1.decimals));
      const balance = this.rootStore.accountStore.getBalance(this.token0);
      if (balance == null) return;
      const percent = amount.times(100).div(balance);
      this.setSellPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
    }
  };
  sellPercent: BN = new BN(0);
  setSellPercent = (value: number | number[]) =>
    (this.sellPercent = new BN(value.toString()));

  sellTotal: BN = BN.ZERO;
  setSellTotal = (total: BN, sync?: boolean) => {
    this.sellTotal = total;
    if (this.sellAmount.gt(0) && this.sellPrice.gt(0) && sync) {
      const v1 = BN.formatUnits(this.sellPrice, this.token1.decimals);
      const v2 = BN.formatUnits(total, this.token1.decimals);
      const amount = BN.parseUnits(v2.div(v1), this.token0.decimals);
      this.setSellAmount(amount);
      const balance = this.rootStore.accountStore.getBalance(this.token0);
      if (balance == null) return;
      const percent = amount.times(100).div(balance);
      this.setSellPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
    }
  };

  get canBuy() {
    return (
      this.rootStore.accountStore.isLoggedIn &&
      this.buyAmount.gt(0) &&
      this.buyPrice.gt(0) &&
      this.buyTotal.gt(0) &&
      !this.buyTotalError
    );
  }

  get canSell() {
    return (
      this.rootStore.accountStore.isLoggedIn &&
      this.sellAmount.gt(0) &&
      this.sellPrice.gt(0) &&
      this.sellTotal.gt(0) &&
      !this.sellAmountError
    );
  }

  get matcherFee() {
    return "1000";
  }

  createPredicateOrder = async (action: OrderAction) => {
    const { accountStore } = this.rootStore;
    if (accountStore.address == null) return;
    const wallet = await accountStore.getWallet();
    if (wallet == null) return;
    const createOrderScript =
      CreateOrderScriptAbi__factory.createInstance(wallet);

    if (createOrderScript == null) return;
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
    if (token0 == null || token1 == null || amount0 == null || amount1 == null)
      return;

    //todo fix cors
    const orderObj = {
      asset0: token0,
      amount0: amount0,
      asset1: token1,
      amount1: amount1,
      owner: this.rootStore.accountStore.ethFormatWallet,
    };

    // const predicateAddress = axios.post(PREDICATE_BUILDER, orderObj);

    const response = await fetch(`${PREDICATE_BUILDER}/create`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(orderObj),
    });
    const data = await response.json();
    const predicateId = data.id;

    // const predicateAddress =
    //   "0x0745c81e5f5e5e95510fc06d00d301df95ffbaa07458b0d4734691ea64d6cb63";
    // "fuel1qazus8jlte0f25g0cpksp5cpm72llw4qw3vtp4rng6g75exked3srwepmc";
    // const id = "DFXtXDB8Rsjm81iJ31DnX90EvLapOa";

    // const orderObject = {
    //   id,
    //   predicate_address: { value: predicateAddress },
    //   // amount0: amount0,
    //   // asset0: { value: token0 },
    //   // amount1: amount1,
    //   // asset1: { value: token1 },
    //   // owner: { value: this.rootStore.accountStore.address },
    //   asset0: { value: token0 },
    //   amount0: "450000",
    //   asset1: { value: token1 },
    //   amount1: "100000",
    //   owner: this.rootStore.accountStore.addressInput,
    // } as CreateOrderParamsInput;
    // const { value, logs } = await createOrderScript.functions
    //   .main(orderObject)
    //   .call();
    // console.log("value", value);
    // console.log("logs", logs);

    //simulates script call -> just make transfer with required amount to predicate
    //todo return

    // const predicateAdr = Address.fromString(predicateAddress);
    // const tx = await wallet.transfer(predicateAdr, amount0, token0);
    // console.log("transfer tx", tx);
    //
    // const predicateBalance = await Wallet.fromAddress(
    //   predicateAddress,
    //   NODE_URL
    // ).getBalances();
    // console.log("predicateBalance", predicateBalance);
    // const realPredicateBalance = BN.ZERO;
    // if (realPredicateBalance.eq(amount0)) {
    if (true) {
      const t0 = TOKENS_BY_ASSET_ID[token0];
      const t1 = TOKENS_BY_ASSET_ID[token1];
      const res = await createOrder({
        id: predicateId,
        owner: this.rootStore.accountStore.ethFormatWallet ?? "",
        asset0: token0,
        amount0,
        asset1: token1,
        amount1,
        address: "predicateAddress",
        type: action === "sell" ? "SELL" : "BUY",
        market: "BTC/USDC",
        price:
          action === "sell"
            ? BN.formatUnits(amount1, t1.decimals)
                .div(BN.formatUnits(amount0, t0.decimals))
                .toNumber()
            : BN.formatUnits(amount0, t0.decimals)
                .div(BN.formatUnits(amount1, t1.decimals))
                .toNumber(),
        timestamp: Date.now(),
        status: "Active",
      });
      console.log(res);
      //todo add post request to be to create order
    }
  };

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
    if (token0 == null || token1 == null || amount0 == null || amount1 == null)
      return;

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
