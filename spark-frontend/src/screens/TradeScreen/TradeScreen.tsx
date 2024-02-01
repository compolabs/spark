import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import BottomTables from "@screens/TradeScreen/BottomTables";
import Chart from "@screens/TradeScreen/Chart";
import MarketStatisticsBar from "@screens/TradeScreen/MarketStatisticsBar";
import StatusBar from "@screens/TradeScreen/StatusBar";
import { Column } from "@src/components/Flex";
import { SmartFlex } from "@src/components/SmartFlex";
import { useMedia } from "@src/hooks/useMedia";
import LeftBlock from "@src/screens/TradeScreen/LeftBlock";
import { CreateOrderSpotVMProvider } from "@src/screens/TradeScreen/LeftBlock/CreateOrderSpot/CreateOrderSpotVM";
import { media } from "@src/themes/breakpoints";
import { useStores } from "@stores";

import CreateOrderSpot from "./LeftBlock/CreateOrderSpot";
import MarketSelection from "./LeftBlock/MarketSelection";
import OrderbookAndTradesInterface from "./OrderbookAndTradesInterface/OrderbookAndTradesInterface";
import SpotOrderBook from "./OrderbookAndTradesInterface/SpotOrderBook";

interface IProps {}

const TradeScreenImpl: React.FC<IProps> = observer(() => {
  const { tradeStore } = useStores();
  const media = useMedia();

  useEffect(() => {
    document.title = `Spark | ${tradeStore.marketSymbol}`;
  }, [tradeStore.marketSymbol]);

  if (media.mobile) {
    return (
      <Root>
        <MarketStatisticsBar />
        <MobileContent>
          <ContentWrapper>
            <SpotOrderBook />
          </ContentWrapper>
          <ContentWrapper>
            <CreateOrderSpot />
          </ContentWrapper>
        </MobileContent>
        <BottomTables />
        <Something isOpen={tradeStore.marketSelectionOpened}>
          <MarketSelection />
        </Something>
      </Root>
    );
  }

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
      <StatusBar />
    </Root>
  );
});

const TradeScreen: React.FC<IProps> = observer(() => {
  const { tradeStore } = useStores();
  const { marketId } = useParams<{ marketId: string }>();
  const spotMarketExists = tradeStore.spotMarkets.some((market) => market.symbol === marketId);
  tradeStore.setMarketSymbol(!marketId || !spotMarketExists ? tradeStore.defaultMarketSymbol : marketId);

  return (
    //я оборачиваю весь TradeScreenImpl в CreateOrderSpotVMProvider потому что при нажатии на трейд в OrderbookAndTradesInterface должно меняться значение в LeftBlock
    <CreateOrderSpotVMProvider>
      <TradeScreenImpl />
    </CreateOrderSpotVMProvider>
  );
});

export default TradeScreen;

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

const Something = styled(SmartFlex)<{ isOpen?: boolean }>`
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
