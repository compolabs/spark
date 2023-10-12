import styled from "@emotion/styled";
import React from "react";
import MarketStatisticsBar from "@screens/TradeScreen/MarketStatisticsBar";
import { Column, Row } from "@src/components/Flex";
import CreateOrderInterface from "@screens/TradeScreen/CreateOrderInterface";
import Chart from "@screens/TradeScreen/Chart";
import BottomTablesInterface from "@screens/TradeScreen/BottomTablesInterface";
import OrderbookAndTradesInterface from "@screens/TradeScreen/OrderbookAndTradesInterface";
import StatusBar from "@screens/TradeScreen/StatusBar";
import { TradeScreenVMProvider } from "@screens/TradeScreen/TradeScreenVm";
import SizedBox from "@components/SizedBox";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  flex: 1;
  box-sizing: border-box;
  padding: 0 4px;
`;

const TradeScreenImpl: React.FC<IProps> = () => {
  return (
    <Root>
      <MarketStatisticsBar />
      <SizedBox height={4} />
      <Row mainAxisSize="stretch" crossAxisSize="max">
        <CreateOrderInterface />
        <SizedBox width={4} />
        <Column mainAxisSize="stretch" crossAxisSize="max" style={{ flex: 5 }}>
          <Chart />
          <BottomTablesInterface />
        </Column>
        <SizedBox width={4} />
        <OrderbookAndTradesInterface />
      </Row>
      <StatusBar />
    </Root>
  );
};

const TradeScreen: React.FC<IProps> = () => (
  <TradeScreenVMProvider>
    <TradeScreenImpl />
  </TradeScreenVMProvider>
);
export default TradeScreen;
