import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import { EXPLORER_URL, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import { LimitOrdersAbi__factory } from "@src/contracts";
import { getLatestTradesInPair, Trade } from "@src/services/TradesService";
import { CoinQuantityLike, hexlify, Predicate, ScriptTransactionRequest } from "fuels";
import { LimitOrderPredicateAbi__factory } from "@src/predicates/factories/LimitOrderPredicateAbi__factory";
import { MAX_GAS_PER_TX } from "@fuel-ts/transactions/configs";

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
    // when(() => this.rootStore.ordersStore.initialized, this.setMarketPrice);

    this.setBuyPrice(new BN(20000 * 1e6), true);
    this.setBuyAmount(new BN(100000), true);
  }

  setMarketPrice = () => {
    const { orderbook } = this.rootStore.ordersStore;
    const buyPrice = BN.parseUnits(orderbook.buy[0].price, this.token0.decimals);
    const sellPrice = BN.parseUnits(orderbook.sell[0].price, this.token1.decimals);
    this.setBuyPrice(sellPrice);
    this.setSellPrice(buyPrice);
  };

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
  setBuyPercent = (value: number | number[]) => (this.buyPercent = new BN(value.toString()));

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
  setSellPercent = (value: number | number[]) => (this.sellPercent = new BN(value.toString()));

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

    const token0 = action === "sell" ? this.token0 : this.token1;
    const token1 = action === "sell" ? this.token1 : this.token0;
    const exp = BN.parseUnits(1, 9 + token0.decimals - token1.decimals);
    let price =
      action === "sell"
        ? this.sellTotal.times(exp).div(this.sellAmount)
        : this.buyAmount.times(exp).div(this.buyTotal);
    let amount = action === "sell" ? this.sellAmount.toString() : this.buyTotal.toString();
    this.setLoading(true);
    console.log(price.toString());
    const configurableConstants = {
      ASSET0: token0.assetId,
      ASSET1: token1.assetId,
      MAKER: this.rootStore.accountStore.ethFormatWallet,
      PRICE: price.toFixed(0),
      ASSET0_DECINALS: token0.decimals,
      ASSET1_DECINALS: token1.decimals,
    };
    console.log(configurableConstants);
    try {
      const predicate = new Predicate(
        LimitOrderPredicateAbi__factory.bin,
        LimitOrderPredicateAbi__factory.abi,
        // new LogProvider(NODE_URL),
        this.rootStore.accountStore.provider,
        configurableConstants
      );

      console.log(predicate.address.toB256());

      const initialPredicateBalance = await predicate.getBalance(token0.assetId);
      console.log("initialPredicateBalance", initialPredicateBalance.toString());
      //
      // console.log("wallet.transfer", amount);

      const tx1 = await wallet
        .transfer(predicate.address, amount, token0.assetId)
        .catch((e) => console.error(`tx1 ${e}`));
      await tx1?.waitForResult();
      //
      const feetx = await wallet
        .transfer(predicate.address, 10)
        .catch((e) => console.error(`feetx ${e}`));
      await feetx?.waitForResult();

      // // console.log("feetx", feetx);
      //
      const predicateBalances = await predicate.getBalances();
      console.log("predicateBalances");
      console.log(
        "predicateBalances",
        predicateBalances.map((v) => v.amount.toString())
      );
      //
      // console.log("predicate.transfer", amount);
      const half = new BN(amount).div(2).toString();
      console.log("half", half);
      // const tx2 = await predicate.transfer(wallet.address, half, token0);
      // console.log("tx2", tx2);
      const params = { gasLimit: MAX_GAS_PER_TX };

      const request = new ScriptTransactionRequest(params);
      request.addCoinOutput(wallet.address, amount, token0.assetId);
      const fee = request.calculateFee();
      let quantities: CoinQuantityLike[] = [];

      if (fee.assetId === hexlify(token0.assetId)) {
        fee.amount = fee.amount.add(amount);
        quantities = [fee];
      } else {
        quantities = [[amount, token0.assetId], fee];
      }

      const resources = await predicate.getResourcesToSpend(quantities);
      request.addResources(resources);
      console.log(request.inputs);
      console.log(request.outputs);
      const tx = await predicate.sendTransaction(request);
      const res = await tx.waitForResult();
      console.log(tx, res);
      const finalPredicateBalance = await predicate.getBalances();
      console.log(
        "finalPredicateBalance",
        finalPredicateBalance.map((v) => v.amount.toString())
      );

      // if (tx.id != null)
      //   this.notifyThatActionIsSuccessful("Order has bee placed", tx.id);
    } catch (e: unknown) {
      console.error(e);
    } finally {
      this.setLoading(false);
    }
  };

  cancelPredicateOrder = async (id: string) => {
    const predicateAddress = "fuel14pa8j25dg6aarc93a6z422lg64tzydpsq3ve8r9ex6l96xp4guzswj0zlu";
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

// inputs = [ResourcePredicate { resource: Coin(Coin { amount: 1000000000, block_created: 741240, asset_id: 56fb8789a590ea9c12af6fe6dc2b43f347700b049d4f823fd4476c6f366af201, utxo_id: UtxoId { tx_id: f9101c7c1acaf4c8aaaf6674500e08f64ce2d59a14fdf3c3df5143f35b201903, output_index: 2 }, maturity: 0, owner: Bech32Address { hrp: "fuel", hash: 12408258e4ac3396e8af356fc828b7804c8175371523e1ee5f75c58c0ec27d8d }, status: Unspent }), code: [], data: UnresolvedBytes { data: [] } }]
// outputs = [Coin { to: ccc4f9249536cf89ab0f31bb52fa06c00ea0387dcac5830924ecf56f2dded3a5, amount: 0, asset_id: 56fb8789a590ea9c12af6fe6dc2b43f347700b049d4f823fd4476c6f366af201 }, Change { to: ccc4f9249536cf89ab0f31bb52fa06c00ea0387dcac5830924ecf56f2dded3a5, amount: 0, asset_id: 56fb8789a590ea9c12af6fe6dc2b43f347700b049d4f823fd4476c6f366af201 }]
