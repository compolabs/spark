import styled from "@emotion/styled";
import React from "react";
import MarketStatisticsBar from "@screens/TradeScreen/MarketStatisticsBar";
import {Column, Row} from "@src/components/Flex";
import CreateOrderInterface from "@screens/TradeScreen/CreateOrderInterface";
import Chart from "@screens/TradeScreen/Chart";
import BottomTablesInterface from "@screens/TradeScreen/BottomTablesInterface";
import OrderbookAndTradesInterface from "@screens/TradeScreen/OrderbookAndTradesInterface";
import StatusBar from "@screens/TradeScreen/StatusBar";
import {TradeScreenVMProvider} from "@screens/TradeScreen/TradeScreenVm";

interface IProps {
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  flex: 1;
`;

const TradeScreenImpl: React.FC<IProps> = () => {
    return <Root>
        <MarketStatisticsBar/>
        <Row mainAxisSize="stretch" crossAxisSize="max">
            <CreateOrderInterface/>
            <Column mainAxisSize="stretch" crossAxisSize="max" style={{flex: 3,}}>
                <Chart/>
                <BottomTablesInterface/>
            </Column>
            <OrderbookAndTradesInterface/>
        </Row>
        <StatusBar/>
    </Root>;
}

const TradeScreen: React.FC<IProps> = () => (
    <TradeScreenVMProvider>
        <TradeScreenImpl/>
    </TradeScreenVMProvider>
);
export default TradeScreen;
