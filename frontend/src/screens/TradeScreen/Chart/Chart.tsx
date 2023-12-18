import React from "react";
import { ChartVMProvider } from "@screens/TradeScreen/Chart/ChartVm";
import styled from "@emotion/styled";
import TradingViewWidget from "@screens/TradeScreen/Chart/TradingViewWidget";

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
	return (
		<Root>
			<ChartVMProvider>
				<TradingViewWidget />
				{/*<TVChartContainer />*/}
			</ChartVMProvider>
		</Root>
	);
};

export default Chart;
