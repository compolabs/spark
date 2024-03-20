import React from "react";
import { observer } from "mobx-react";

import { useStores } from "@src/stores";

import PerpTable from "./PerpTable";
import SpotTable from "./SpotTable";

const BottomTables: React.FC = observer(() => {
  const { tradeStore } = useStores();

  if (tradeStore.isPerp) {
    return <PerpTable />;
  }

  return <SpotTable />;
});

export default BottomTables;
