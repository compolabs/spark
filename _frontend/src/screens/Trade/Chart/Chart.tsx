import React from "react";
import { ChartVMProvider } from "@screens/Trade/Chart/ChartVm";
import TVChartContainer from "@screens/Trade/Chart/TVChartContainer";

interface IProps {}

const Chart: React.FC<IProps> = () => {
  return null;
  return (
    <ChartVMProvider>
      <TVChartContainer />
    </ChartVMProvider>
  );
};

export default Chart;
