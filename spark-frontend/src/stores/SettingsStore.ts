import { makeAutoObservable } from "mobx";

import { THEME_TYPE } from "@src/themes/ThemeProvider";
import RootStore from "@stores/RootStore";

export interface ISerializedSettingStore {
  isUserAgreedWithTerms: boolean;
  tradeTableSize: number;
}

export enum TRADE_TABLE_SIZE {
  XS,
  S,
  M,
  L,
}

class SettingsStore {
  public readonly rootStore: RootStore;
  selectedTheme: THEME_TYPE = THEME_TYPE.DARK_THEME;

  constructor(rootStore: RootStore, initState?: ISerializedSettingStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    if (initState) {
      this.setIsUserAgreedWithTerms(initState.isUserAgreedWithTerms);
      this.setTradeTableSize(initState.tradeTableSize);
    }
  }

  isUserAgreedWithTerms = false;
  setIsUserAgreedWithTerms = (value: boolean) => (this.isUserAgreedWithTerms = value);

  depositModalOpened: boolean = false;
  setDepositModal = (s: boolean) => (this.depositModalOpened = s);

  tradeTableSize: TRADE_TABLE_SIZE = TRADE_TABLE_SIZE.S;
  setTradeTableSize = (v: TRADE_TABLE_SIZE) => (this.tradeTableSize = v);

  serialize = (): ISerializedSettingStore => ({
    isUserAgreedWithTerms: this.isUserAgreedWithTerms,
    tradeTableSize: this.tradeTableSize,
  });
}

export default SettingsStore;
