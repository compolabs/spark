import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import BottomTables from "@screens/TradeScreen/BottomTables";
import Chart from "@screens/TradeScreen/Chart";
import MarketStatisticsBar from "@screens/TradeScreen/MarketStatisticsBar";
import { Column } from "@src/components/Flex";
import LeftBlock from "@src/screens/TradeScreen/LeftBlock";
import { media } from "@src/themes/breakpoints";

import OrderbookAndTradesInterface from "./OrderbookAndTradesInterface/OrderbookAndTradesInterface";

const TradeScreenDesktop: React.FC = observer(() => {
  return (
    <Root>
      <MarketStatisticsBar />
      <ContentContainer>
        <LeftBlock />
        <Column crossAxisSize="max" mainAxisSize="stretch" style={{ flex: 5 }}>
          <Chart />
          <BottomTables />
        </Column>
        <OrderbookAndTradesInterface />
      </ContentContainer>
    </Root>
  );
});

export default TradeScreenDesktop;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  flex: 1;
  padding: 0 12px;
  gap: 4px;

  position: relative;

  ${media.mobile} {
    padding: 0 4px;
    gap: 8px;
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(min-content, 280px) minmax(300px, 1fr) minmax(100px, 280px);
  width: 100%;
  height: 100%;
  gap: 4px;
`;
