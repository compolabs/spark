import { storesContext, useStores } from "@stores/useStores";

import AccountStore from "./AccountStore";
import FaucetStore from "./FaucetStore";
import NotificationStore from "./NotificationStore";
// import SpotOrdersStore from "./SpotOrdersStore";
import OracleStore from "./OracleStore";
import RootStore from "./RootStore";
import SettingsStore from "./SettingsStore";
import TradeStore from "./TradeStore";

export {
  AccountStore,
  FaucetStore,
  NotificationStore,
  OracleStore,
  RootStore,
  SettingsStore,
  storesContext,
  // SpotOrdersStore,
  TradeStore,
  useStores,
};
