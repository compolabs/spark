import styled from "@emotion/styled";
import React from "react";
import { Observer } from "mobx-react-lite";
import Layout from "@components/Layout";
import { TradeVMProvider } from "@screens/Trade/TradeVm";
import OrderBook from "@screens/Trade/OrderBook";
import PairsList from "@screens/Trade/PairsList";
import Chart from "./Chart";
import Order from "./Order";
import Tables from "./Tables";

interface IProps {}

const Root = styled.div`
  width: 100%;
  display: grid;
  grid-template:
    "orderbook chart pairs" 484px
    "orderbook order pairs" 308px
    "tables tables tables" 290px / minmax(250px, 340px) minmax(510px, 1fr) minmax(250px, 326px);
  gap: 4px;
  height: calc(100vh - 40px);
  margin: 16px;
`;

const TradeImpl: React.FC<IProps> = () => {
  return (
    <Layout>
      <Observer>
        {() => {
          return (
            <Root>
              <OrderBook />
              <Chart />
              <Order />
              <PairsList />
              <Tables />
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
