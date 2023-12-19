import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import { Column, Row } from "@components/Flex";
import { useTheme } from "@emotion/react";
import BN from "@src/utils/BN";
import useEventListener from "@src/utils/useEventListener";
import { useSpotTradeScreenVM } from "@screens/TradeScreen/SpotTradeVm";

interface IProps {}

const Root = styled(Column)`
	width: 100%;
`;
const Header = styled.div<{}>`
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
	max-height: calc(100vh - 200px);
`;
const SpotTrades: React.FC<IProps> = observer(() => {
	const vm = useSpotTradeScreenVM();
	const { tradeStore } = useStores();
	const theme = useTheme();
	const [amountOfOrders, setAmountOfOrders] = useState(0);

	const calcSize = () => setAmountOfOrders(+new BN(window.innerHeight - 194).div(17).toFixed(0));

	useEffect(calcSize, []);
	const handleResize = useCallback(calcSize, []);

	useEventListener("resize", handleResize);

	const trades = vm.trades.slice(-amountOfOrders);

	if (tradeStore.perpOrders.length === 0)
		return (
			<Root alignItems="center" justifyContent="center" mainAxisSize="stretch">
				<Text type={TEXT_TYPES.SUPPORTING}>No trades yet</Text>
			</Root>
		);
	return (
		<Root>
			<SizedBox height={8} />
			<Header>
				<Text type={TEXT_TYPES.SUPPORTING}>Price {vm.token1.symbol}</Text>
				<Text type={TEXT_TYPES.SUPPORTING} style={{ textAlign: "right" }}>
					Qty({vm.token0.symbol})
				</Text>
				<Text type={TEXT_TYPES.SUPPORTING}>Time</Text>
			</Header>
			<SizedBox height={8} />

			<Container>
				{trades.map((trade) => (
					<Row alignItems="center" justifyContent="space-between" style={{ marginBottom: 2 }} key={"trade" + trade.id}>
						<Text type={TEXT_TYPES.BODY} color={theme.colors.textPrimary}>
							{trade.price.toFormat(2)}
						</Text>
						<Text type={TEXT_TYPES.BODY} color={theme.colors.textPrimary}>
							{trade.amount}
						</Text>
						<Text type={TEXT_TYPES.BODY} color={theme.colors.textPrimary}>
							{trade.time}
						</Text>
					</Row>
				))}
			</Container>
		</Root>
	);
});
export default SpotTrades;
//tradeStore.perpTrades.
