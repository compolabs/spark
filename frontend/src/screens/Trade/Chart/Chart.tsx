import styled from "@emotion/styled";
import React, { useEffect } from "react";
// import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";
import {
  ChartOptions,
  ColorType,
  createChart,
  CrosshairMode,
  DeepPartial,
} from "lightweight-charts";
import { ChartVMProvider } from "@screens/Trade/Chart/ChartVm";

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

const chartOptions: DeepPartial<ChartOptions> = {
  layout: {
    textColor: "white",
    background: { type: ColorType.Solid, color: "black" },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
  grid: { vertLines: { visible: false }, horzLines: { visible: false } },
};

const areaOptions = {
  lineColor: "#2962FF",
  topColor: "#2962FF",
  bottomColor: "rgba(41, 98, 255, 0.28)",
};

const ChartImpl: React.FC<IProps> = observer(() => {
  const vm = useTradeVM();

  useEffect(() => {
    const chart = createChart(
      document.getElementById("chart-container")!,
      chartOptions
    );

    const areaSeries = chart.addAreaSeries(areaOptions);

    areaSeries.setData([]);

    chart.timeScale().fitContent();
  });
  return <Root id="chart-container" />;
});

const Chart: React.FC<IProps> = () => (
  <ChartVMProvider>
    <ChartImpl />
  </ChartVMProvider>
);

export default Chart;
