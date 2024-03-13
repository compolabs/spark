import React, { PropsWithChildren, useMemo } from "react";
import BigNumber from "bignumber.js";
import _ from "lodash";
import { makeAutoObservable, reaction } from "mobx";

import Toast from "@src/components/Toast";
import { DEFAULT_DECIMALS } from "@src/constants";
import useVM from "@src/hooks/useVM";
import BN from "@src/utils/BN";
import { handleEvmErrors } from "@src/utils/handleEvmErrors";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<CreateOrderVM | null>(null);

export const CreateOrderVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new CreateOrderVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useCreateOrderVM = () => useVM(ctx);

const HALF_GWEI = new BN(5 * 1e9); // 0.5
const PRICE_UPDATE_THROTTLE_INTERVAL = 1000; // 1s

export enum ORDER_MODE {
  BUY,
  SELL,
}

export enum ACTIVE_INPUT {
  Price,
  Amount,
  Total,
}

export enum ORDER_TYPE {
  Market,
  Limit,
  StopMarket,
  StopLimit,
  TakeProfit,
  TakeProfitLimit,
}

const UPDATE_ALLOWANCE_INTERVAL = 15 * 1000; // 15 sec;

class CreateOrderVM {
  loading = false;

  mode: ORDER_MODE = ORDER_MODE.BUY;

  activeInput: ACTIVE_INPUT = ACTIVE_INPUT.Amount;

  inputPrice: BN = BN.ZERO;
  inputAmount: BN = BN.ZERO;
  inputPercent: BN = BN.ZERO;
  inputTotal: BN = BN.ZERO;

  allowance: BN = BN.ZERO;

  private allowanceUpdater: IntervalUpdater;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    const { tradeStore, oracleStore, settingsStore } = this.rootStore;

    reaction(
      () => oracleStore.prices,
      () => {
        const { orderType } = settingsStore;
        const token = tradeStore.market?.baseToken;
        const price = token?.priceFeed ? oracleStore.getTokenIndexPrice(token?.priceFeed) : BN.ZERO;

        if (orderType === ORDER_TYPE.Market) {
          this.setInputPriceDebounce(price, true);
        } else if (
          orderType === ORDER_TYPE.Limit &&
          this.inputPrice.eq(BN.ZERO) &&
          this.activeInput !== ACTIVE_INPUT.Price
        ) {
          this.setInputPriceDebounce(price);
        }
      },
    );

    this.allowanceUpdater = new IntervalUpdater(this.loadAllowance, UPDATE_ALLOWANCE_INTERVAL);

    this.allowanceUpdater.run(true);
  }

  get canProceed() {
    return this.inputAmount.gt(0) && this.inputPrice.gt(0) && this.inputTotal.gt(0) && !this.isInputError;
  }

  get isInputError(): boolean {
    const { tradeStore, balanceStore } = this.rootStore;
    const { market } = tradeStore;
    const amount = this.isSell ? this.inputAmount : this.inputTotal;
    const token = this.isSell ? market!.baseToken.assetId : market!.quoteToken.assetId;
    const balance = balanceStore.getBalance(token);
    return balance ? amount.gt(balance) : false;
  }

  get isSell(): boolean {
    return this.mode === ORDER_MODE.SELL;
  }

  get tokenIsApproved() {
    const amount = this.isSell ? this.inputAmount : this.inputTotal;
    return this.allowance.gte(amount);
  }

  setOrderMode = (mode: ORDER_MODE) => (this.mode = mode);

  onMaxClick = () => {
    const { tradeStore, balanceStore, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    const tokenId = this.isSell ? tradeStore.market!.baseToken.assetId : tradeStore.market!.quoteToken.assetId;

    let balance = balanceStore.getBalance(tokenId) ?? BN.ZERO;
    if (tokenId === bcNetwork!.getTokenBySymbol("ETH").assetId) {
      balance = balance.minus(HALF_GWEI);
    }

    if (this.isSell) {
      this.setInputAmount(balance, true);
      return;
    }

    this.setInputTotal(balance, true);
  };

  setInputPrice = (price: BN, sync?: boolean) => {
    const { tradeStore } = this.rootStore;

    this.inputPrice = price;

    if (price.eq(0)) {
      this.setInputTotal(BN.ZERO);
      return;
    }

    if (!sync) return;

    const formattedPrice = BN.formatUnits(price, DEFAULT_DECIMALS);
    const formattedAmount = BN.formatUnits(this.inputAmount, tradeStore.market!.baseToken.decimals);
    const formattedTotal = BN.formatUnits(this.inputTotal, tradeStore.market!.quoteToken.decimals);

    if (this.activeInput === ACTIVE_INPUT.Amount || this.activeInput === ACTIVE_INPUT.Price) {
      const total = BN.parseUnits(formattedAmount.times(formattedPrice), tradeStore.market!.quoteToken.decimals);
      this.setInputTotal(total);
    } else if (this.activeInput === ACTIVE_INPUT.Total) {
      const amount = BN.parseUnits(formattedTotal.div(formattedPrice), tradeStore.market!.baseToken.decimals);
      this.setInputAmount(amount);
    }
  };

  setInputPriceDebounce = _.throttle(this.setInputPrice, PRICE_UPDATE_THROTTLE_INTERVAL);

  setInputAmount = (amount: BN, sync?: boolean) => {
    const { tradeStore, balanceStore } = this.rootStore;
    this.inputAmount = amount.toDecimalPlaces(0);

    if (this.inputPrice.eq(BN.ZERO)) {
      this.inputTotal = BN.ZERO;
      return;
    }

    if (!sync) return;

    const formattedInputPrice = BN.formatUnits(this.inputPrice, DEFAULT_DECIMALS);
    const formattedAmount = BN.formatUnits(amount, tradeStore.market!.baseToken.decimals);

    const total = BN.parseUnits(formattedAmount.times(formattedInputPrice), tradeStore.market!.quoteToken.decimals);
    this.setInputTotal(total);

    const relativeToken = this.isSell ? tradeStore.market!.baseToken : tradeStore.market!.quoteToken;
    const balance = balanceStore.getBalance(relativeToken.assetId);
    if (balance.eq(BN.ZERO)) return;

    let percentageOfTotal = BN.ratioOf(total, balance);

    if (this.isSell) {
      percentageOfTotal = BN.ratioOf(amount, balance);
    }

    const inputPercent = percentageOfTotal.gt(100) ? 100 : percentageOfTotal.toDecimalPlaces(0).toNumber();
    this.setInputPercent(inputPercent);
  };

  setInputPercent = (value: number | number[]) => (this.inputPercent = new BN(value.toString()));

  setInputTotal = (total: BN, sync?: boolean) => {
    const { tradeStore, balanceStore } = this.rootStore;
    this.inputTotal = total.toDecimalPlaces(0);

    if (this.inputPrice.eq(BN.ZERO)) {
      this.inputAmount = BN.ZERO;
      return;
    }

    if (!sync) return;

    const formattedInputPrice = BN.formatUnits(this.inputPrice, DEFAULT_DECIMALS);
    const formattedTotal = BN.formatUnits(total, tradeStore.market!.quoteToken.decimals);

    const inputAmount = BN.parseUnits(formattedTotal.div(formattedInputPrice), tradeStore.market!.baseToken.decimals);
    this.setInputAmount(inputAmount);

    const relativeToken = this.isSell ? tradeStore.market!.baseToken : tradeStore.market!.quoteToken;
    const balance = balanceStore.getBalance(relativeToken.assetId);
    if (balance.eq(BN.ZERO)) return;

    let percentageOfTotal = BN.ratioOf(total, balance);

    if (this.isSell) {
      percentageOfTotal = BN.ratioOf(this.inputAmount, balance);
    }

    const inputPercent = percentageOfTotal.gt(100) ? 100 : percentageOfTotal.toDecimalPlaces(0).toNumber();
    this.setInputPercent(inputPercent);
  };

  approve = async () => {
    const { tradeStore, notificationStore, blockchainStore } = this.rootStore;
    const { market } = tradeStore;
    const bcNetwork = blockchainStore.currentInstance;

    if (!market) return;

    const baseToken = market.baseToken;
    const quoteToken = market.quoteToken;

    const activeToken = this.isSell ? baseToken : quoteToken;
    const approveAmount = (this.isSell ? this.inputAmount : this.inputTotal).toDecimalPlaces(0, BigNumber.ROUND_UP);

    this.setLoading(true);

    try {
      await bcNetwork?.approve(activeToken.assetId, approveAmount.toString());
      await this.loadAllowance();

      notificationStore.toast(`${activeToken.symbol} approved!`, { type: "success" });
    } catch (error) {
      console.error(error);
      handleEvmErrors(notificationStore, error, `Something goes wrong with ${activeToken.symbol} approve`);
    }

    this.setLoading(false);
  };

  loadAllowance = async () => {
    const { tradeStore, blockchainStore } = this.rootStore;
    const { market } = tradeStore;
    const bcNetwork = blockchainStore.currentInstance;

    const baseToken = market?.baseToken;
    const quoteToken = market?.quoteToken;

    const activeToken = this.isSell ? baseToken : quoteToken;

    if (!activeToken?.assetId) return;

    try {
      const allowance = await bcNetwork!.allowance(activeToken.assetId);

      this.allowance = new BN(allowance);
    } catch (error) {
      console.error("Something wrong with allowance!");
      this.allowance = BN.ZERO;
    }
  };

  createOrder = async () => {
    const { tradeStore, notificationStore, balanceStore, blockchainStore } = this.rootStore;
    const { market } = tradeStore;
    const bcNetwork = blockchainStore.currentInstance;

    if (!market) return;

    this.setLoading(true);
    if (bcNetwork?.getIsExternalWallet()) {
      notificationStore.toast("Please, confirm operation in your wallet", { type: "info" });
    }

    try {
      const baseToken = market.baseToken;
      const baseSize = this.isSell ? this.inputAmount.times(-1) : this.inputAmount;

      const hash = await bcNetwork?.createOrder(baseToken.assetId, baseSize.toString(), this.inputPrice.toString());

      notificationStore.toast(<Toast hash={hash} networkType={bcNetwork!.NETWORK_TYPE} text="Order Created" />);

      await this.loadAllowance();
    } catch (error: any) {
      console.error(error);
      handleEvmErrors(notificationStore, error, "We were unable to process your order at this time");
    }

    await balanceStore.update();

    this.setLoading(false);
  };

  private setLoading = (l: boolean) => (this.loading = l);

  setActiveInput = (input?: ACTIVE_INPUT) => (this.activeInput = input === undefined ? ACTIVE_INPUT.Amount : input);
}
