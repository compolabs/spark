import AccountStore, { ISerializedAccountStore } from "@stores/AccountStore";
import SettingsStore from "@stores/SettingsStore";
import NotificationStore from "@stores/NotificationStore";
import { makeAutoObservable } from "mobx";
import OrdersStore from "@stores/OrdersStore";
import ReferralStore, { ISerializedReferralStore } from "@stores/ReferralStore";
import OracleStore from "@stores/OracleStore";
import TradeStore, { ISerializedTradeStore } from "@stores/TradeStore";

export interface ISerializedRootStore {
	accountStore?: ISerializedAccountStore;
	referralStore?: ISerializedReferralStore;
	tradeStore?: ISerializedTradeStore;
}

export default class RootStore {
	public accountStore: AccountStore;
	public settingsStore: SettingsStore;
	public notificationStore: NotificationStore;
	public ordersStore: OrdersStore;
	public tradeStore: TradeStore;
	public referralStore: ReferralStore;
	public oracleStore: OracleStore;

	constructor(initState?: ISerializedRootStore) {
		this.accountStore = new AccountStore(this, initState?.accountStore);
		this.settingsStore = new SettingsStore(this);
		this.notificationStore = new NotificationStore(this);
		this.ordersStore = new OrdersStore(this);
		this.tradeStore = new TradeStore(this, initState?.tradeStore);
		this.referralStore = new ReferralStore(this, initState?.referralStore);
		this.oracleStore = new OracleStore(this);
		makeAutoObservable(this);
	}

	get initialized() {
		return this.accountStore.provider != null;
	}

	serialize = (): ISerializedRootStore => ({
		accountStore: this.accountStore.serialize(),
		referralStore: this.referralStore.serialize(),
		tradeStore: this.tradeStore.serialize(),
	});
}
