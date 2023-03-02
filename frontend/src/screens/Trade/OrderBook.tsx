import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  background: #222936;
  grid-area: orderbook;
`;

const OrderBook: React.FC<IProps> = () => {
  // btc/usdt
  //token 0  - btc
  //token 1  - usdt
  const data = [
    { priceToken1: "3.72", amountToken0: "3.72", totalToken1: "3.72" },
    { priceToken1: "3.72", amountToken0: "3.72", totalToken1: "3.72" },
    { priceToken1: "3.72", amountToken0: "3.72", totalToken1: "3.72" },
    { priceToken1: "3.72", amountToken0: "3.72", totalToken1: "3.72" },
    { priceToken1: "3.72", amountToken0: "3.72", totalToken1: "3.72" },
    { priceToken1: "3.72", amountToken0: "3.72", totalToken1: "3.72" },
    { priceToken1: "3.72", amountToken0: "3.72", totalToken1: "3.72" },
  ];
  return <Root>OrderBook</Root>;
};
export default observer(OrderBook);
