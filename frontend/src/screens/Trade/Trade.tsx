import styled from "@emotion/styled";
import React, { useState } from "react";
import { Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import { TradeVMProvider } from "@screens/Trade/TradeVm";
import PairsList from "@screens/Trade/PairsList";
import Tables from "./Tables";
import useWindowSize from "@src/hooks/useWindowSize";
import MobileStats from "@screens/Trade/MobileStats";
import TradingViewWidget from "./Chart";
import SizedBox from "@components/SizedBox";
import Trades from "@screens/Trade/Trades";
import Tabs from "@components/Tabs";
import DesktopOrderBook from "./DesktopOrderBook";
import MobileOrderBook from "@screens/Trade/MobileOrderBook";
import CreateOrderDesktop from "./CreateOrder/CreateOrderDesktop";
import CreateOrderMobile from "./CreateOrder/CreateOrderMobile";

interface IProps {}

const Root = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: calc(100vh - 48px);

  @media (min-width: 880px) {
    height: calc(100vh - 62px);
    display: grid;
    grid-template:
      "orderbook chart pairs" 484px
      "orderbook order trades" 308px
      "tables tables tables" 290px / minmax(250px, 340px) minmax(510px, 1fr) minmax(250px, 326px);
  }
`;
const OrderBookAndChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #222936;
  padding: 12px 16px;
  height: 100%;
`;
const TradeImpl: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  const [activeTab, setActiveTab] = useState(1);
  return (
    <Layout>
      <Observer>
        {() => {
          return (
            <Root>
              {width && width >= 880 ? (
                <>
                  {/*<Row style={{ height: 64, gridArea: "ticker" }} mainAxisSize="stretch" />*/}
                  <DesktopOrderBook />
                  <TradingViewWidget />
                  <CreateOrderDesktop />
                  <PairsList />
                  <Trades />
                  <Tables />
                </>
              ) : (
                <>
                  <MobileStats />
                  <PairsList />
                  <Trades />
                  <OrderBookAndChartContainer>
                    <Tabs
                      tabs={[{ name: "Chart" }, { name: "Order book" }]}
                      activeTab={activeTab}
                      setActive={(t) => setActiveTab(t)}
                    />
                    <SizedBox height={8} />
                    {activeTab === 0 && <TradingViewWidget />}
                    {activeTab === 1 && <MobileOrderBook />}
                  </OrderBookAndChartContainer>
                  <Tables />
                  <CreateOrderMobile />
                </>
              )}
            </Root>
          );
        }}
      </Observer>
    </Layout>
  );
};

const Trade: React.FC<IProps> = () => (
  <TradeVMProvider>
    <TradeImpl />
  </TradeVMProvider>
);
export default Trade;
