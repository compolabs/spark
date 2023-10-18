import AccountStore, { ISerializedAccountStore } from "@stores/AccountStore";
import SettingsStore, { ISerializedSettingsStore } from "@stores/SettingsStore";
import NotificationStore from "@stores/NotificationStore";
import { makeAutoObservable } from "mobx";
import OrdersStore from "@stores/OrdersStore";

export interface ISerializedRootStore {
	accountStore?: ISerializedAccountStore;
	settingsStore?: ISerializedSettingsStore;
}

export default class RootStore {
	public accountStore: AccountStore;
	public settingsStore: SettingsStore;
	public notificationStore: NotificationStore;
	public ordersStore: OrdersStore;

	constructor(initState?: ISerializedRootStore) {
		this.accountStore = new AccountStore(this, initState?.accountStore);
		this.settingsStore = new SettingsStore(this, initState?.settingsStore);
		this.notificationStore = new NotificationStore(this);
		this.ordersStore = new OrdersStore(this);
		makeAutoObservable(this);
	}

	get initialized() {
		return this.accountStore.provider != null;
	}

	serialize = (): ISerializedRootStore => ({
		accountStore: this.accountStore.serialize(),
		settingsStore: this.settingsStore.serialize()
	});
}
