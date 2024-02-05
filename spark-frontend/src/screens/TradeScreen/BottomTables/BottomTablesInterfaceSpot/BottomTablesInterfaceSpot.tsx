import React from "react";

import BottomTablesInterfaceSpotImpl from "./BottomTablesInterfaceSpotImpl";
import { BottomTablesInterfaceSpotVMProvider } from "./BottomTablesInterfaceSpotVM";

const BottomTablesInterfaceSpot: React.FC = () => (
  <BottomTablesInterfaceSpotVMProvider>
    <BottomTablesInterfaceSpotImpl />
  </BottomTablesInterfaceSpotVMProvider>
);

export default BottomTablesInterfaceSpot;
