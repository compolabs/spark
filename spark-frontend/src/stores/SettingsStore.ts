import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import { getCurrentBrowser } from "@src/utils/getCurrentBrowser";
import { THEME_TYPE } from "@src/themes/ThemeProvider";

export interface ISerializedSettingsStore {}

class SettingsStore {
	public readonly rootStore: RootStore;
	selectedTheme: THEME_TYPE = THEME_TYPE.DARK_THEME;

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
