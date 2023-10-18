import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import { THEME_TYPE } from "@src/themes/ThemeProvider";

export interface ISerializedSettingsStore {
	addresses: string;
}

class SettingsStore {
	public readonly rootStore: RootStore;
	selectedTheme: THEME_TYPE = THEME_TYPE.DARK_THEME;

	constructor(rootStore: RootStore, initState?: ISerializedSettingsStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
		if (initState) {
			this.setVerifiedAddresses(initState.addresses?.split(",") ?? []);
		}
	}

	walletModalOpened: boolean = false;
	setWalletModalOpened = (s: boolean) => (this.walletModalOpened = s);

	verifiedAddresses: string[] = [];
	setVerifiedAddresses = (addresses: string[]) => (this.verifiedAddresses = addresses);
	addVerifiedAddress = (address: string) => {
		if (this.verifiedAddresses.includes(address)) return;
		this.setVerifiedAddresses([...this.verifiedAddresses, address]);
	};

	get access(): boolean {
		const address = this.rootStore.accountStore.address;
		if (address == null) return false;
		return this.verifiedAddresses.includes(address);
	}

	serialize = (): ISerializedSettingsStore => ({
		addresses: this.verifiedAddresses.length === 0 ? "" : this.verifiedAddresses.join(","),
	});
}

export default SettingsStore;
