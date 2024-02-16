import React from "react";
import styled from "@emotion/styled";

import { ChartVMProvider } from "@screens/TradeScreen/Chart/ChartVm";

import TradingViewWidget from "./TradingViewWidget";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 3;
  box-sizing: border-box;

  & > * {
    width: 100%;
    height: 100%;
  }
`;

const Chart: React.FC<IProps> = () => {
  const isChartExcluded = process.env.REACT_APP_IS_CHART_LIBRARY_EXCLUDED === "true";

  return (
    <Root>
      <ChartVMProvider>{!isChartExcluded && <TradingViewWidget />}</ChartVMProvider>
    </Root>
  );
};

export default Chart;
