import React from "react";

import PerpTableImpl from "./PerpTableImpl";
import { PerpTableVMProvider } from "./PerpTableVM";

const PerpTable: React.FC = () => (
  <PerpTableVMProvider>
    <PerpTableImpl />
  </PerpTableVMProvider>
);

export default PerpTable;
