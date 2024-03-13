import React from "react";

import { useStores } from "@src/stores";

import PerpTable from "./PerpTable";
import SpotTable from "./SpotTable";

const BottomTables: React.FC = () => {
  const { tradeStore } = useStores();

  if (tradeStore.isPerp) {
    return <PerpTable />;
  }

  return <SpotTable />;
};

export default BottomTables;
