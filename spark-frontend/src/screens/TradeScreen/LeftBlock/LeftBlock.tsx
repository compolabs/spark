import React, { ComponentProps } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import MarketSelection from "@src/screens/TradeScreen/LeftBlock/MarketSelection";
import { useStores } from "@stores";

import CreateOrderSpot from "./CreateOrderSpot";

interface IProps extends ComponentProps<any> {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 280px;
  height: 100%;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.bgSecondary};
`;

const LeftBlock: React.FC<IProps> = observer(({ ...rest }) => {
  const { tradeStore } = useStores();
  return <Root {...rest}>{tradeStore.marketSelectionOpened ? <MarketSelection /> : <CreateOrderSpot />}</Root>;
});
export default LeftBlock;
