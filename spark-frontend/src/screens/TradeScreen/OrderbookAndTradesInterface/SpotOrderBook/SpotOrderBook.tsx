import React from "react";

import SpotOrderBookImpl from "./SpotOrderBookImpl";
import { SpotOrderbookVMProvider } from "./SpotOrderbookVM";

const SpotOrderBook: React.FC = () => (
  <SpotOrderbookVMProvider>
    <SpotOrderBookImpl />
  </SpotOrderbookVMProvider>
);

export default SpotOrderBook;
