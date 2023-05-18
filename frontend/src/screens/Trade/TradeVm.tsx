import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import {
  EXPLORER_URL,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
} from "@src/constants";
import BN from "@src/utils/BN";
import { LimitOrdersAbi__factory } from "@src/contracts";
import { getLatestTradesInPair, Trade } from "@src/services/TradesService";
import PREDICATE_ABI from "@src/assets/predicateAbi.json";
import PREDICATE_BYTECODE from "@src/assets/predicateBytecode.json";
import { Predicate } from "fuels";

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

    let token0 = null;
    let token1 = null;
    let price = null;
    let amount = null;
    if (action === "buy") {
      token0 = this.assetId1;
      token1 = this.assetId0;
      price = this.buyTotal.times(1000000).div(this.buyAmount);
      amount = this.buyTotal.toString();
    }
    if (action === "sell") {
      token0 = this.assetId0;
      token1 = this.assetId1;
      price = new BN(this.sellTotal).times(1000000).div(this.sellAmount);
      amount = this.sellAmount.toString();
    }
    if (token0 == null || token1 == null || price == null || amount == null)
      return;
    this.setLoading(true);

    const configurableConstants = {
      ASSET0: token0,
      ASSET1: token1,
      PRICE: price.toFixed(0),
      MAKER: this.rootStore.accountStore.ethFormatWallet,
    };

    console.log("configurableConstants", configurableConstants);
    try {
      const predicate = new Predicate(
        PREDICATE_BYTECODE,
        PREDICATE_ABI,
        this.rootStore.accountStore.provider,
        configurableConstants
      );
      // console.log("predicate", predicate.address);
      // console.log("amount", amount);
      // console.log("token0", token0);

      const initialPredicateBalance = await predicate.getBalance(token0);
      console.log("initialPredicateBalance", initialPredicateBalance);

      console.log("wallet.transfer", amount);
      const tx1 = await wallet.transfer(predicate.address, amount, token0);
      // console.log("tx1", tx1);
      await tx1.waitForResult();

      const feetx = await wallet.transfer(predicate.address, 50);
      await feetx.waitForResult();
      // console.log("feetx", feetx);

      const prediBalance = await predicate.getBalances();
      console.log("prediBalances", prediBalance);

      console.log("predicate.transfer", amount);
      const tx2 = await predicate.transfer(wallet.address, amount, token0);
      // console.log("tx2", tx2);
      await tx2.waitForResult();

      const finalPredicateBalance = await predicate.getBalance(token0);
      console.log("finalPredicateBalance", finalPredicateBalance);

      // if (tx.id != null)
      //   this.notifyThatActionIsSuccessful("Order has bee placed", tx.id);
    } catch (e: unknown) {
      console.error(e);
    } finally {
      this.setLoading(false);
    }
  };

  cancelPredicateOrder = async (id: string) => {
    const predicateAddress =
      "fuel14pa8j25dg6aarc93a6z422lg64tzydpsq3ve8r9ex6l96xp4guzswj0zlu";
    // const price = "250000000";
    const amount = "1000000";

    // const predicate = Wallet.fromAddress(
    //   predicateAddress,
    //   this.rootStore.accountStore.provider
    // );
    // const initialPredicateBalance = await predicate.getBalance(
    //   "0x56fb8789a590ea9c12af6fe6dc2b43f347700b049d4f823fd4476c6f366af201"
    // );
    // console.log("initialPredicateBalance", initialPredicateBalance.toString());
    //
    // const wallet = await this.rootStore.accountStore.getWallet();
    // if (wallet == null) return;
    //
    // const tx = await predicate.transfer(
    //   wallet.address,
    //   amount,
    //   "0x56fb8789a590ea9c12af6fe6dc2b43f347700b049d4f823fd4476c6f366af201"
    // );
    // console.log("tx", tx);

    // const predicate = ;

    // const wallet = this.rootStore.accountStore.getWallet();
    // if (wallet == null) return;
    // const outputs = wallet;

    //cancel_order(&predicate, &alice, usdc.asset_id, amount0)
    //let outputs = wallet.get_asset_outputs_for_amount(wallet.address(), asset0, 0);

    const inputs = "";
    const cancel = 0;
  };
  cancelOrder = async (id: string) => {
    const { accountStore } = this.rootStore;
    if (accountStore.address == null) return;
    const wallet = await accountStore.getWallet();
    if (wallet == null) return;
    const limitOrdersContract = LimitOrdersAbi__factory.connect(
      // CONTRACT_ADDRESSES.limitOrders,
      "",
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
