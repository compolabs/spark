import styled from "@emotion/styled";
import React from "react";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const MobileOrderBook: React.FC<IProps> = () => {
  return <Root>MobileOrderBook</Root>;
};
export default MobileOrderBook;
