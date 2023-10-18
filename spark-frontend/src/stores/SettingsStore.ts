import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import { THEME_TYPE } from "@src/themes/ThemeProvider";

export interface ISerializedSettingsStore {}

class SettingsStore {
	public readonly rootStore: RootStore;
	selectedTheme: THEME_TYPE = THEME_TYPE.DARK_THEME;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
	}

	walletModalOpened: boolean = false;
	setWalletModalOpened = (s: boolean) => (this.walletModalOpened = s);

	access: boolean = false;
	setAccess = (s: boolean) => (this.access = s);
}

export default SettingsStore;
