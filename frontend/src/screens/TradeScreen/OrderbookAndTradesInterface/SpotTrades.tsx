import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import { usePerpTradeVM } from "@screens/TradeScreen/PerpTradeVm";
import { observer } from "mobx-react";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
`;
const OrderBookHeader = styled.div<{}>`
	width: 100%;
	box-sizing: border-box;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	padding: 0 12px;
	text-align: center;

	& > * {
		text-align: start;
	}

	& > :last-of-type {
		text-align: end;
	}
`;
const Container = styled.div<{
	fitContent?: boolean;
	reverse?: boolean;
}>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
	${({ fitContent }) => !fitContent && "height: 100%;"};
	${({ reverse }) => reverse && "flex-direction: column-reverse;"};
	height: 100%;
`;
const SpotTrades: React.FC<IProps> = observer(() => {
	const vm = usePerpTradeVM();
	return (
		<Root>
			<SizedBox height={8} />
			<OrderBookHeader>
				<Text type={TEXT_TYPES.SUPPORTING}>Amount {vm.token0.symbol}</Text>
				<Text type={TEXT_TYPES.SUPPORTING}>Total {vm.token1.symbol}</Text>
				<Text type={TEXT_TYPES.SUPPORTING}>Price {vm.token1.symbol}</Text>
			</OrderBookHeader>
			<SizedBox height={8} />
			<Container> data </Container>
		</Root>
	);
});
export default SpotTrades;
