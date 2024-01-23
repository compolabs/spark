import { makeAutoObservable } from "mobx";

import { THEME_TYPE } from "@src/themes/ThemeProvider";
import RootStore from "@stores/RootStore";

export interface ISerializedSettingStore {
	tradeTableSize: string | null;
}

class SettingsStore {
	public readonly rootStore: RootStore;
	selectedTheme: THEME_TYPE = THEME_TYPE.DARK_THEME;

	constructor(rootStore: RootStore, initState?: ISerializedSettingStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
		if (initState) {
			this.setTradeTableSize(initState.tradeTableSize);
		}
	}

	depositModalOpened: boolean = false;
	setDepositModal = (s: boolean) => (this.depositModalOpened = s);

	tradeTableSize: string | null = null;
	setTradeTableSize = (v: string | null) => (this.tradeTableSize = v);

	serialize = (): ISerializedSettingStore => ({
		tradeTableSize: this.tradeTableSize,
	});
}

export default SettingsStore;
