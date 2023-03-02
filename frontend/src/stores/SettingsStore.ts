import RootStore from "@stores/RootStore";
import { THEME_TYPE } from "@src/themes/ThemeProvider";
import { makeAutoObservable } from "mobx";
import { getCurrentBrowser } from "@src/utils/getCurrentBrowser";
import { CONTRACT_ADDRESSES, IContractsConfig, NODE_URL } from "@src/constants";

export interface ISerializedSettingsStore {
  selectedTheme: THEME_TYPE | null;
  version: string | null;
}

class SettingsStore {
  public readonly rootStore: RootStore;

  constructor(rootStore: RootStore, initState?: ISerializedSettingsStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    if (initState != null) {
      initState.selectedTheme != null &&
        (this.selectedTheme = initState.selectedTheme);
      initState.version != null && (this.version = initState.version);
    }
  }

  version: string = "0.2.0";
  setVersion = (s: string) => (this.version = s);

  selectedTheme: THEME_TYPE = THEME_TYPE.DARK_THEME;

  toggleTheme = (): void => {
    this.selectedTheme =
      this.selectedTheme === THEME_TYPE.LIGHT_THEME
        ? THEME_TYPE.DARK_THEME
        : THEME_TYPE.LIGHT_THEME;
  };

  serialize = (): ISerializedSettingsStore => ({
    selectedTheme: this.selectedTheme,
    version: this.version,
  });

  walletModalOpened: boolean = false;
  setWalletModalOpened = (s: boolean) => (this.walletModalOpened = s);

  network: string = NODE_URL;
  setNetwork = (s: string) => (this.network = s);

  loginModalOpened: boolean = false;
  setLoginModalOpened = (s: boolean) => (this.loginModalOpened = s);

  get doesBrowserSupportsFuelWallet(): boolean {
    //todo
    //https://fuels-wallet.vercel.app/docs/browser-support/
    const browser = getCurrentBrowser();
    return ["chrome", "firefox", "brave", "edge"].includes(browser);
  }

  get currentVersionConfig(): IContractsConfig {
    if (this.version == null) {
      return CONTRACT_ADDRESSES["0.2.0"];
    }
    return CONTRACT_ADDRESSES[this.version];
  }
}

export default SettingsStore;
