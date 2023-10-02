import styled from "@emotion/styled";
import React from "react";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  flex:1;
`;

const BottomTablesInterface: React.FC<IProps> = () => {
  return <Root></Root>;
}
export default BottomTablesInterface;
