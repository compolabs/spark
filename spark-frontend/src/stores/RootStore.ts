import { makeAutoObservable } from "mobx";

import AccountStore, { ISerializedAccountStore } from "@stores/AccountStore";
import NotificationStore from "@stores/NotificationStore";
import SettingsStore, { ISerializedSettingStore } from "@stores/SettingsStore";
// import OracleStore from "@stores/OracleStore";
import TradeStore, { ISerializedTradeStore } from "@stores/TradeStore";

import { BalanceStore } from "./BalanceStore";

export interface ISerializedRootStore {
	accountStore?: ISerializedAccountStore;
	tradeStore?: ISerializedTradeStore;
	settingStore?: ISerializedSettingStore;
}

export default class RootStore {
	public accountStore: AccountStore;
	// public oracleStore: OracleStore;
	public settingsStore: SettingsStore;
	public notificationStore: NotificationStore;
	// public spotOrdersStore: SpotOrdersStore;
	public tradeStore: TradeStore;
	public balanceStore: BalanceStore;

	constructor(initState?: ISerializedRootStore) {
		this.accountStore = new AccountStore(this, initState?.accountStore);
		// this.spotOrdersStore = new SpotOrdersStore(this);
		this.settingsStore = new SettingsStore(this, initState?.settingStore);
		this.notificationStore = new NotificationStore(this);
		// this.oracleStore = new OracleStore(this);
		this.tradeStore = new TradeStore(this, initState?.tradeStore);
		this.balanceStore = new BalanceStore(this);
		makeAutoObservable(this);
	}

	get initialized() {
		return this.accountStore.initialized && this.tradeStore.initialized;
	}

	serialize = (): ISerializedRootStore => ({
		accountStore: this.accountStore.serialize(),
		// tradeStore: this.tradeStore.serialize(),
		settingStore: this.settingsStore.serialize(),
	});
}
