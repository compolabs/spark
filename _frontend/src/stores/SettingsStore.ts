import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import { getCurrentBrowser } from "@src/utils/getCurrentBrowser";
import { NODE_URL } from "@src/constants";

export interface ISerializedSettingsStore {}

class SettingsStore {
  public readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  walletModalOpened: boolean = false;
  setWalletModalOpened = (s: boolean) => (this.walletModalOpened = s);

  network: string = NODE_URL;
  setNetwork = (s: string) => (this.network = s);

  loginModalOpened: boolean = false;
  setLoginModalOpened = (s: boolean) => (this.loginModalOpened = s);

  get doesBrowserSupportsFuelWallet(): boolean {
    //https://fuels-wallet.vercel.app/docs/browser-support/
    const browser = getCurrentBrowser();
    return ["chrome", "firefox", "brave", "edge"].includes(browser);
  }
}

export default SettingsStore;
