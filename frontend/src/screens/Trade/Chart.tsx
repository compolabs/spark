import styled from "@emotion/styled";
import React from "react";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: chart;
  background: #222936;
`;

const Chart: React.FC<IProps> = () => {
  return <Root>Graphic</Root>;
};
export default Chart;
