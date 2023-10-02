import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import { getCurrentBrowser } from "@src/utils/getCurrentBrowser";

export interface ISerializedSettingsStore {}

class SettingsStore {
  public readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get doesBrowserSupportsFuelWallet(): boolean {
    //https://fuels-wallet.vercel.app/docs/browser-support/
    const browser = getCurrentBrowser();
    return ["chrome", "firefox", "brave", "edge"].includes(browser);
  }
}

export default SettingsStore;
