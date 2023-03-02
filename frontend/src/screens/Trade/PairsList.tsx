import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: pairs;
  background: #222936;
`;

const PairsList: React.FC<IProps> = () => {
  return <Root>PairsList</Root>;
};
export default PairsList;
