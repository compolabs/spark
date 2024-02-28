import { makeAutoObservable, reaction, runInAction } from "mobx";

import { TOKENS_LIST } from "@src/constants";
import BN from "@src/utils/BN";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";

import RootStore from "./RootStore";

const UPDATE_INTERVAL = 10 * 1000;

export class BalanceStore {
  public balances: Map<string, BN> = new Map();

  private balancesUpdater: IntervalUpdater;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.balancesUpdater = new IntervalUpdater(this.update, UPDATE_INTERVAL);

    this.balancesUpdater.run();

    const { accountStore } = rootStore;

    reaction(
      () => accountStore.isConnected,
      (isConnected) => {
        if (!isConnected) {
          this.balances = new Map();
          return;
        }

        this.balancesUpdater.update();
      },
      { fireImmediately: true },
    );
  }

  get nonZeroBalancesAssetIds() {
    const nonZeroBalances: string[] = [];
    this.balances.forEach((balance, assetId) => {
      if (balance && balance.gt(BN.ZERO)) {
        nonZeroBalances.push(assetId);
      }
    });
    return nonZeroBalances;
  }

  update = async () => {
    const { accountStore } = this.rootStore;

    if (!accountStore.isConnected) return;

    try {
      for (const token of TOKENS_LIST) {
        const balance = await this.fetchBalance(token.assetId);
        runInAction(() => {
          this.balances.set(token.assetId, new BN(balance));
        });
      }
    } catch (error) {
      console.error("Error updating token balances:", error);
    }
  };

  getBalance = (assetId: string) => {
    return this.balances.get(assetId) ?? BN.ZERO;
  };

  getFormatBalance = (assetId: string, decimals: number) => {
    return BN.formatUnits(this.getBalance(assetId), decimals).toFormat(2) ?? "-";
  };

  private fetchBalance = async (assetId: string): Promise<string> => {
    const { accountStore } = this.rootStore;

    if (!accountStore.isConnected) return "0";

    const balance = await accountStore.blockchain!.getBalance(accountStore.address!, assetId);

    return balance;
  };
}
