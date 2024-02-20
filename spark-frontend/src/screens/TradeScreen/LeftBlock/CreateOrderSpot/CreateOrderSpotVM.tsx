import React, { PropsWithChildren, useMemo } from "react";
import { ethers } from "ethers";
import { makeAutoObservable, reaction } from "mobx";

import { ERC20_ABI, SPOT_MARKET_ABI } from "@src/abi";
import Toast from "@src/components/Toast";
import { CONTRACT_ADDRESSES, DEFAULT_DECIMALS, TOKENS_BY_SYMBOL } from "@src/constants";
import useVM from "@src/hooks/useVM";
import BN from "@src/utils/BN";
import { handleEvmErrors } from "@src/utils/handleEvmErrors";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<CreateOrderSpotVM | null>(null);

export const CreateOrderSpotVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new CreateOrderSpotVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useCreateOrderSpotVM = () => useVM(ctx);

const HALF_GWEI = new BN(5 * 1e9); // 0.5

export enum ORDER_MODE {
  BUY,
  SELL,
}

export enum ORDER_TYPE {
  Market,
  Limit,
  StopMarket,
  StopLimit,
  TakeProfit,
  TakeProfitLimit,
}

class CreateOrderSpotVM {
  loading = false;

  mode: ORDER_MODE = ORDER_MODE.BUY;

  orderType: ORDER_TYPE = ORDER_TYPE.Market;

  inputPrice: BN = BN.ZERO;
  inputAmount: BN = BN.ZERO;
  inputPercent: BN = BN.ZERO;
  inputTotal: BN = BN.ZERO;

  allowance: BN = BN.ZERO;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    //todo обработать маркет и лимит типы заказов в селекторе

    const { tradeStore, notificationStore } = this.rootStore;

    reaction(
      () => tradeStore.market?.price,
      (price) => {
        if (this.orderType === ORDER_TYPE.Market) {
          this.setInputPrice(price ?? BN.ZERO);
        }
      },
    );

    reaction(
      () => [this.mode, tradeStore.market],
      async () => {
        await this.loadAllowance();
      },
      { fireImmediately: true },
    );
  }

  get canProceed() {
    return this.inputAmount.gt(0) && this.inputPrice.gt(0) && this.inputTotal.gt(0) && !this.inputTotalError;
  }

  get inputTotalError(): boolean {
    const { tradeStore, balanceStore } = this.rootStore;
    const balance = balanceStore.getBalance(tradeStore.market!.quoteToken.assetId);
    return balance ? this.inputTotal.gt(balance) : false;
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
    const { tradeStore, balanceStore } = this.rootStore;

    const tokenId = this.isSell ? tradeStore.market!.baseToken.assetId : tradeStore.market!.quoteToken.assetId;

    let balance = balanceStore.getBalance(tokenId) ?? BN.ZERO;
    if (tokenId === TOKENS_BY_SYMBOL.ETH.assetId) {
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

    const total = BN.parseUnits(formattedAmount.times(formattedPrice), tradeStore.market!.quoteToken.decimals);
    this.setInputTotal(total);
  };

  setInputAmount = (amount: BN, sync?: boolean) => {
    const { tradeStore, balanceStore } = this.rootStore;
    this.inputAmount = amount.toDecimalPlaces(0);

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
    this.inputTotal = total;

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
    const { accountStore, tradeStore, notificationStore } = this.rootStore;
    const { market } = tradeStore;

    if (!accountStore.signer || !market) return;

    const baseToken = market.baseToken;
    const quoteToken = market.quoteToken;

    const activeToken = this.isSell ? baseToken : quoteToken;
    const approveAmount = this.isSell ? this.inputAmount : this.inputTotal;

    this.setLoading(true);

    try {
      const tokenContract = new ethers.Contract(activeToken.assetId, ERC20_ABI, accountStore.signer);
      const approveTransaction = await tokenContract.approve(CONTRACT_ADDRESSES.spotMarket, approveAmount.toString());

      await approveTransaction.wait();
      await this.loadAllowance();

      notificationStore.toast(`${activeToken.symbol} approved!`, { type: "success" });
    } catch (error) {
      notificationStore.toast(`Something goes wrong with ${activeToken.symbol} approve`, { type: "error" });
    }

    this.setLoading(false);
  };

  loadAllowance = async () => {
    const { accountStore, tradeStore } = this.rootStore;
    const { market } = tradeStore;

    const baseToken = market?.baseToken;
    const quoteToken = market?.quoteToken;

    const activeToken = this.isSell ? baseToken : quoteToken;

    if (!activeToken?.assetId) return;

    try {
      const tokenContract = new ethers.Contract(activeToken.assetId, ERC20_ABI, accountStore.signer);
      const allowance = await tokenContract.allowance(accountStore.address, CONTRACT_ADDRESSES.spotMarket);

      this.allowance = new BN(allowance.toString());
    } catch (error) {
      console.error("Something wrong with allowance!");
      this.allowance = BN.ZERO;
    }
  };

  createOrder = async () => {
    const { accountStore, tradeStore, notificationStore, balanceStore } = this.rootStore;
    const { market } = tradeStore;

    if (!accountStore.signer || !market) return;

    this.setLoading(true);

    try {
      const baseToken = market.baseToken;
      const baseSize = this.isSell ? this.inputAmount.times(-1) : this.inputAmount;

      const spotMarketContract = new ethers.Contract(
        CONTRACT_ADDRESSES.spotMarket,
        SPOT_MARKET_ABI,
        accountStore.signer,
      );
      const openOrderTransaction = await spotMarketContract.openOrder(
        baseToken.assetId,
        baseSize.toString(),
        this.inputPrice.toString(),
      );
      await openOrderTransaction.wait();
      notificationStore.toast(<Toast hash={openOrderTransaction.hash} text="Order Created" />);
    } catch (error: any) {
      console.error(error);
      handleEvmErrors(notificationStore, error, "We were unable to process your order at this time");
    }

    await balanceStore.update();

    this.setLoading(false);
  };

  setOrderType = (type: ORDER_TYPE) => (this.orderType = type);

  private setLoading = (l: boolean) => (this.loading = l);
}
