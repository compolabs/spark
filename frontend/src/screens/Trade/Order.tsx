import styled from "@emotion/styled";
import React from "react";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  background: #222936;
  grid-area: order;
`;

const Order: React.FC<IProps> = () => {
  return <Root>Order</Root>;
};
export default Order;
