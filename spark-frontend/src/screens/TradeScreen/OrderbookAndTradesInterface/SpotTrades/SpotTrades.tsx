import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import { observer } from "mobx-react";
import { Column, Row } from "@components/Flex";
import { useTheme } from "@emotion/react";
import BN from "@src/utils/BN";
import useEventListener from "@src/utils/useEventListener";
import {
	SpotTradesVMProvider,
	useSpotTradesVM,
} from "@screens/TradeScreen/OrderbookAndTradesInterface/SpotTrades/SpotTradesVM";
import dayjs from "dayjs";
import { useStores } from "@stores";

//todo отрефакторить и перенесть часть логики в вью модель (amountOfOrders и calcSize, например)
//todo добавить лоадер
//todo починить форматирование в таблице
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
const SpotTradesImpl: React.FC<IProps> = observer(() => {
	const vm = useSpotTradesVM();
	const { tradeStore } = useStores();
	const theme = useTheme();
	const [amountOfOrders, setAmountOfOrders] = useState(0);

	const calcSize = () => setAmountOfOrders(+new BN(window.innerHeight - 194).div(17).toFixed(0));

	useEffect(calcSize, []);
	const handleResize = useCallback(calcSize, []);

	useEventListener("resize", handleResize);

	const trades = vm.trades.slice(-amountOfOrders);
	if (trades.length === 0)
		return (
			<Root alignItems="center" justifyContent="center" mainAxisSize="stretch">
				<Text type={TEXT_TYPES.SUPPORTING}>No trades yet</Text>
			</Root>
		);
	return (
		<Root>
			<SizedBox height={8} />
			<Header>
				{/*todo добавить описание из tradeStore в каком токене столбец (например Price USDC | Qty BTC)*/}
				<Text type={TEXT_TYPES.SUPPORTING}>Price</Text>
				<Text type={TEXT_TYPES.SUPPORTING} style={{ textAlign: "right" }}>
					Qty
				</Text>
				<Text type={TEXT_TYPES.SUPPORTING}>Time</Text>
			</Header>
			<SizedBox height={8} />

			<Container>
				{trades.map((trade) => (
					<Row alignItems="center" justifyContent="space-between" style={{ marginBottom: 2 }} key={"trade" + trade.id}>
						<Text type={TEXT_TYPES.BODY} color={theme.colors.textPrimary}>
							{/*todo влзможно трейд надо сделать классом и добавть priceUnits */}

							{BN.formatUnits(trade.price, 9).toFormat(2)}
						</Text>
						<Text type={TEXT_TYPES.BODY} color={theme.colors.textPrimary}>
							{/*todo тут тоже было бы круто если б trade был классом*/}
							{BN.formatUnits(trade.tradeAmount, tradeStore.market?.baseToken.decimals).toFormat(2)}
						</Text>
						<Text type={TEXT_TYPES.BODY} color={theme.colors.textPrimary}>
							{dayjs(trade.timestamp).format("HH:mm")}
						</Text>
					</Row>
				))}
			</Container>
		</Root>
	);
});

const SpotTrades = () => (
	<SpotTradesVMProvider>
		<SpotTradesImpl />
	</SpotTradesVMProvider>
);
export default SpotTrades;
