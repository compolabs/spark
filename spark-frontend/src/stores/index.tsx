import { storesContext, useStores } from "@stores/useStores";

import AccountStore from "./AccountStore";
import NotificationStore from "./NotificationStore";
import RootStore from "./RootStore";
import SettingsStore from "./SettingsStore";
// import SpotOrdersStore from "./SpotOrdersStore";
// import OracleStore from "./OracleStore";
import TradeStore from "./TradeStore";

export {
  AccountStore,
  NotificationStore,
  RootStore,
  SettingsStore,
  // OracleStore,
  storesContext,
  // SpotOrdersStore,
  TradeStore,
  useStores,
};
