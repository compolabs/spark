import styled from "@emotion/styled";
import React from "react";
// import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
// import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: chart;
  background: #222936;
  width: 100%;
  justify-content: center;
  align-items: stretch;

  height: 410px;

  @media (min-width: 880px) {
    height: unset;
  }
`;

const Chart: React.FC<IProps> = () => {
  // const vm = useTradeVM();
  return (
    <Root>
      {/* <AdvancedRealTimeChart
        symbol={`${vm.token0.symbol}${vm.token1.symbol}`}
        interval="1"
        style="8"
        theme="dark"
        autosize
      /> */}
    </Root>
  );
};
export default observer(Chart);
