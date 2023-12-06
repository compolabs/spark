import AccountStore, { ISerializedAccountStore } from "@stores/AccountStore";
import SettingsStore from "@stores/SettingsStore";
import NotificationStore from "@stores/NotificationStore";
import { makeAutoObservable } from "mobx";
import OrdersStore from "@stores/OrdersStore";
import OracleStore from "@stores/OracleStore";
import TradeStore, { ISerializedTradeStore } from "@stores/TradeStore";

export interface ISerializedRootStore {
	accountStore?: ISerializedAccountStore;
	tradeStore?: ISerializedTradeStore;
}

export default class RootStore {
	public accountStore: AccountStore;
	public settingsStore: SettingsStore;
	public notificationStore: NotificationStore;
	public ordersStore: OrdersStore;
	public tradeStore: TradeStore;
	public oracleStore: OracleStore;

	constructor(initState?: ISerializedRootStore) {
		this.accountStore = new AccountStore(this, initState?.accountStore);
		this.settingsStore = new SettingsStore(this);
		this.notificationStore = new NotificationStore(this);
		this.oracleStore = new OracleStore(this);
		this.ordersStore = new OrdersStore(this);
		this.tradeStore = new TradeStore(this, initState?.tradeStore);
		makeAutoObservable(this);
	}

	get initialized() {
		return this.accountStore.provider != null;
	}
	serialize = (): ISerializedRootStore => ({
		accountStore: this.accountStore.serialize(),
		tradeStore: this.tradeStore.serialize(),
	});
}
