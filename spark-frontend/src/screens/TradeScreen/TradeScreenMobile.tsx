import React, { useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import BottomTables from "@screens/TradeScreen/BottomTables";
import Chart from "@screens/TradeScreen/Chart";
import MarketStatisticsBar from "@screens/TradeScreen/MarketStatisticsBar";
import { SmartFlex } from "@src/components/SmartFlex";
import { media } from "@src/themes/breakpoints";
import { useStores } from "@stores";

import CreateOrderSpot from "./LeftBlock/CreateOrderSpot";
import MarketSelection from "./LeftBlock/MarketSelection";
import SpotOrderBook from "./OrderbookAndTradesInterface/SpotOrderBook";
import MarketStatistics from "./MarketStatistics";

const TradeScreenMobile: React.FC = observer(() => {
  const { tradeStore } = useStores();
  const [isChartOpen, setIsChartOpen] = useState(false);

  const handleToggleChart = () => {
    setIsChartOpen((isOpen) => !isOpen);
  };

  const renderChartInfo = () => {
    return (
      <>
        <MarketStatistics />
        <Chart />
      </>
    );
  };

  const renderOrderBook = () => {
    return (
      <MobileContent>
        <ContentWrapper>
          <SpotOrderBook />
        </ContentWrapper>
        <ContentWrapper>
          <CreateOrderSpot />
        </ContentWrapper>
      </MobileContent>
    );
  };

  const renderContent = () => {
    if (isChartOpen) return renderChartInfo();

    return renderOrderBook();
  };

  return (
    <Root>
      <MarketStatisticsBar isChartOpen={isChartOpen} onSwitchClick={handleToggleChart} />
      {renderContent()}
      <BottomTables />
      <OverlayContainer isOpen={tradeStore.marketSelectionOpened}>
        <MarketSelection />
      </OverlayContainer>
    </Root>
  );
});

export default TradeScreenMobile;

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

const MobileContent = styled.div`
  display: grid;
  grid-template-areas: "orderbook .";
  grid-template-columns: 140px 1fr;
  gap: 8px;
  width: 100%;
  min-height: 418px;
`;

const ContentWrapper = styled(SmartFlex)`
  background-color: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;
  height: fit-content;

  &:first-of-type {
    height: 100%;
  }
`;

const OverlayContainer = styled(SmartFlex)<{ isOpen?: boolean }>`
  position: absolute;
  top: 40px;
  right: 0;
  z-index: 100;
  padding: 0 4px;
  background: ${({ theme }) => `${theme.colors.bgPrimary}`};
  height: ${({ isOpen }) => (isOpen ? "calc(100vh - 40px)" : "0")};
  width: 100%;
  overflow: hidden;
  transition: 0.2s;
`;
