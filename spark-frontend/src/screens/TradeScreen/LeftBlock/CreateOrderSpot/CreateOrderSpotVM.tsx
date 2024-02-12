import React, { PropsWithChildren, useMemo } from "react";
import { ethers } from "ethers";
import { makeAutoObservable, reaction } from "mobx";

import { ERC20_ABI, SPOT_MARKET_ABI } from "@src/abi";
import Toast from "@src/components/Toast";
import { CONTRACT_ADDRESSES, DEFAULT_DECIMALS, TOKENS_BY_SYMBOL } from "@src/constants";
import useVM from "@src/hooks/useVM";
import BN from "@src/utils/BN";
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

class CreateOrderSpotVM {
  loading = false;

  mode: ORDER_MODE = ORDER_MODE.BUY;

  inputPrice: BN = BN.ZERO;
  inputAmount: BN = BN.ZERO;
  inputPercent: BN = BN.ZERO;
  inputTotal: BN = BN.ZERO;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    //todo обработать маркет и лимит типы заказов в селекторе

    const { tradeStore, notificationStore } = this.rootStore;

    reaction(
      () => tradeStore.market?.price,
      (price) => this.setInputPrice(price ?? BN.ZERO),
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
    this.inputAmount = amount;

    if (!sync) return;

    const formattedInputPrice = BN.formatUnits(this.inputPrice, DEFAULT_DECIMALS);
    const formattedAmount = BN.formatUnits(amount, tradeStore.market!.baseToken.decimals);

    const total = BN.parseUnits(formattedAmount.times(formattedInputPrice), tradeStore.market!.quoteToken.decimals);
    this.setInputTotal(total);

    const relativeToken = this.isSell ? tradeStore.market!.baseToken : tradeStore.market!.quoteToken;
    const balance = balanceStore.getBalance(relativeToken.assetId);
    if (!balance) return;

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
    if (!balance) return;

    let percentageOfTotal = BN.ratioOf(total, balance);

    if (this.isSell) {
      percentageOfTotal = BN.ratioOf(this.inputAmount, balance);
    }

    const inputPercent = percentageOfTotal.gt(100) ? 100 : percentageOfTotal.toDecimalPlaces(0).toNumber();
    this.setInputPercent(inputPercent);
  };

  createOrder = async () => {
    const { accountStore, tradeStore, notificationStore, balanceStore } = this.rootStore;
    const { market } = tradeStore;

    if (!accountStore.signer || !market) return;

    this.setLoading(true);

    try {
      const baseToken = market.baseToken;
      const quoteToken = market.quoteToken;
      const baseSize = this.isSell ? this.inputAmount.times(-1) : this.inputAmount;
      const activeToken = this.isSell ? baseToken : quoteToken;

      const tokenContract = new ethers.Contract(activeToken.assetId, ERC20_ABI, accountStore.signer);
      await tokenContract.approve(CONTRACT_ADDRESSES.spotMarket, this.inputTotal.toString());

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
    } catch (error) {
      notificationStore.toast("We were unable to process your order at this time", { type: "warning" });
    }

    await balanceStore.update();

    this.setLoading(false);
  };

  private setLoading = (l: boolean) => (this.loading = l);
}
