import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import MarketSelection from "@src/screens/TradeScreen/LeftBlock/MarketSelection";
import { useStores } from "@stores";

import CreateOrder from "./CreateOrder";

const LeftBlock: React.FC = observer(() => {
  const { tradeStore } = useStores();
  return <Root>{tradeStore.marketSelectionOpened ? <MarketSelection /> : <CreateOrder />}</Root>;
});

export default LeftBlock;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 280px;
  height: 100%;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.bgSecondary};
`;
