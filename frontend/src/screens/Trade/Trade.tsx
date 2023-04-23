import styled from "@emotion/styled";
import React from "react";
import { Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import { TradeVMProvider } from "@screens/Trade/TradeVm";
import OrderBook from "@screens/Trade/OrderBook";
import PairsList from "@screens/Trade/PairsList";
import Tables from "./Tables";
import useWindowSize from "@src/hooks/useWindowSize";
import MobileStats from "@screens/Trade/MobileStats";
import OrderDesktop from "@screens/Trade/Order/OrderDesktop";
import OrderMobile from "@screens/Trade/Order/OrderMobile";
import TradingViewWidget from "./Chart";
import SizedBox from "@components/SizedBox";
import Trades from "@screens/Trade/Trades";

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

const TradeImpl: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  return (
    <Layout>
      <Observer>
        {() => {
          return (
            <Root>
              {width && width >= 880 ? (
                <>
                  <OrderBook />
                  <TradingViewWidget />
                  <OrderDesktop />
                  <PairsList />
                  <Trades />
                  <Tables />
                  <SizedBox height={1} />
                </>
              ) : (
                <>
                  <MobileStats />
                  <PairsList />
                  <Trades />
                  <TradingViewWidget />
                  <Tables />
                  <OrderMobile />
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
