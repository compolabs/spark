import React from "react";

import SpotTableImpl from "./SpotTableImpl";
import { SpotTableVMProvider } from "./SpotTableVM";

const SpotTable: React.FC = () => (
  <SpotTableVMProvider>
    <SpotTableImpl />
  </SpotTableVMProvider>
);

export default SpotTable;
