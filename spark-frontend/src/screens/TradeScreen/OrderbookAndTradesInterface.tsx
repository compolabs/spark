import styled from "@emotion/styled";
import React from "react";

interface IProps {}
const Root = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid white;
  border-top: 0;
  border-bottom: 0;
  box-sizing: border-box;
  padding: 16px;
  flex:1;
  height: 100%;
`;

const OrderbookAndTradesInterface: React.FC<IProps> = () => {
  return <Root></Root>;
}
export default OrderbookAndTradesInterface;
