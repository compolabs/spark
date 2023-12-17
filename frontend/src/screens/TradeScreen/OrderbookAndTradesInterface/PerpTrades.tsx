import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import { usePerpTradeVM } from "@screens/TradeScreen/PerpTradeVm";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import Skeleton from "react-loading-skeleton";
import { Row } from "@components/Flex";
import { useTheme } from "@emotion/react";

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
	box-sizing: border-box;
	padding: 0 12px;
	overflow-x: hidden;
	overflow-y: auto;
	//overflow-y: auto;
	max-height: calc(100vh - 200px);
`;
const PerpTrades: React.FC<IProps> = observer(() => {
	const vm = usePerpTradeVM();
	const { tradeStore } = useStores();
	const theme = useTheme();
	//todo add limit amount
	return (
		<Root>
			<SizedBox height={8} />
			<OrderBookHeader>
				<Text type={TEXT_TYPES.SUPPORTING}>Price {vm.token1.symbol}</Text>
				{/*<Text type={TEXT_TYPES.SUPPORTING}>Timestamp</Text>*/}
				<div />
				<Text type={TEXT_TYPES.SUPPORTING} style={{ textAlign: "right" }}>
					Qty({vm.token0.symbol})
				</Text>
			</OrderBookHeader>
			<SizedBox height={8} />

			<Container>
				{/*{Array.from({ length: 100 })*/}
				{tradeStore.perpTrades.map((trade) => (
					<Row alignItems="center" justifyContent="space-between" style={{ marginBottom: 2 }}>
						<Text type={TEXT_TYPES.BODY} color={theme.colors.textPrimary}>
							{trade.formattedPrice.toFormat(2)}
						</Text>
						<Text type={TEXT_TYPES.BODY} color={theme.colors.textPrimary}>
							{trade.formattedTradeAmount.toFormat(2)}
						</Text>
					</Row>
				))}
			</Container>
			{/*{tradeStore.perpTrades == null ? (*/}
			{/*	<Skeleton height={48} style={{ margin: 4 }} count={15} />*/}
			{/*) : (*/}
			{/*	<Container> PerpTrades data </Container>*/}
			{/*)}*/}
		</Root>
	);
});
export default PerpTrades;
//tradeStore.perpTrades.
