import { makeAutoObservable } from "mobx";
import AccountStore, { ISerializedAccountStore } from "@stores/AccountStore";
import SettingsStore, { ISerializedSettingsStore } from "@stores/SettingsStore";
import NotificationStore from "@stores/NotificationStore";
import PricesStore from "@stores/PricesStore";

export interface ISerializedRootStore {
  accountStore?: ISerializedAccountStore;
  settingsStore?: ISerializedSettingsStore;
}

export default class RootStore {
  public accountStore: AccountStore;
  public settingsStore: SettingsStore;
  public notificationStore: NotificationStore;
  public pricesStore: PricesStore;

  constructor(initState?: ISerializedRootStore) {
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.settingsStore = new SettingsStore(this, initState?.settingsStore);
    this.notificationStore = new NotificationStore(this);
    this.pricesStore = new PricesStore(this);
    makeAutoObservable(this);
  }

  serialize = (): ISerializedRootStore => ({
    accountStore: this.accountStore.serialize(),
    settingsStore: this.settingsStore.serialize(),
  });
}
