import { storesContext, useStores } from "@stores/useStores";

import RootStore from "./RootStore";
import AccountStore from "./AccountStore";
import SettingsStore from "./SettingsStore";
import NotificationStore from "./NotificationStore";
// import SpotOrdersStore from "./SpotOrdersStore";
// import OracleStore from "./OracleStore";
import TradeStore from "./TradeStore";

export {
	RootStore,
	SettingsStore,
	AccountStore,
	NotificationStore,
	// SpotOrdersStore,
	TradeStore,
	// OracleStore,
	storesContext,
	useStores,
};
