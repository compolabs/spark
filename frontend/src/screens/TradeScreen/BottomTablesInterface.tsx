import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import React, { useState } from "react";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import { useTradeScreenVM } from "@screens/TradeScreen/SpotTradeVm";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import dayjs from "dayjs";
import { useTheme } from "@emotion/react";
import Chip from "@src/components/Chip";
import Tab from "@components/Tab";

interface IProps {}

const Root = styled.div`
	background: ${({ theme }) => theme.colors.bgSecondary};
	display: flex;
	width: 100%;
	flex-direction: column;
	box-sizing: border-box;
	border: 1px solid ${({ theme }) => theme.colors.bgSecondary};
	flex: 1;
	max-height: 190px;
	overflow: hidden;
	border-radius: 10px;

	max-width: 100%;
	overflow-x: scroll;

	& > * {
		min-width: 580px;
	}
`;

export const TableTitle = styled(Text)`
	flex: 1;
	white-space: nowrap;
	${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]}
`;

export const TableText = styled(Text)`
	flex: 1;
	display: flex;
	align-items: center;
`;

export const TableRow = styled(Row)`
	margin-bottom: 1px;
	height: 32px;
	flex-shrink: 0;
	background: ${({ theme }) => theme.colors.bgPrimary};
	align-items: center;
	padding: 0 12px;
	box-sizing: border-box;

	:last-of-type {
		margin-bottom: 0;
	}
`;

export const TableBody = styled(Column)`
	overflow: scroll;
	width: 100%;
	box-sizing: border-box;
`;

const TabContainer = styled(Row)`
	align-items: center;
	box-sizing: border-box;
	padding: 0 12px;
	height: 32px;

	& > * {
		margin: 0 12px;
	}
`;

const CancelButton = styled(Chip)`
	cursor: pointer;
	border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;

const tabs = [
	{ title: "POSITIONS", disabled: false },
	{ title: "ORDERS", disabled: false },
	{ title: "TRADES", disabled: true },
	{ title: "UNSETTLED P&L", disabled: true },
	{ title: "BALANCES", disabled: true },
	{ title: "HISTORY", disabled: true },
];
const columns = [
	["Pair", "Size", "Avg.Ent Price", "Mark price", "Marg. Ratio", "Margin", "Unrealized PNL", ""],
	["Date", "Pair", "Status", "Type", "Amount", "Filled", "Price", ""],
];
const BottomTablesInterface: React.FC<IProps> = observer(() => {
	const { ordersStore, tradeStore } = useStores();
	const [tabIndex, setTabIndex] = useState(1);
	const theme = useTheme();
	const vm = useTradeScreenVM();
	const orders = [];
	const positions = [];
	return (
		<Root>
			<TabContainer>
				{tabs.map(({ title, disabled }, index) => (
					<Tab disabled={disabled} key={title} active={tabIndex === index} onClick={() => !disabled && setTabIndex(index)}>
						{title}
					</Tab>
				))}
			</TabContainer>
			<TableRow>
				{columns[tabIndex].map((v) => (
					<TableTitle>{v}</TableTitle>
				))}
				<TableTitle>
					<Row justifyContent="flex-end">{/*<CancelButton>Cancel all</CancelButton>*/}</Row>
				</TableTitle>
			</TableRow>
			<TableBody>
				{tradeStore.positions.slice().map((position) => {
					return (
						<TableRow key={position.id}>
							{[].map(() => (
								<TableText>hueta</TableText>
							))}
						</TableRow>
					);
				})}
				{/*{ordersStore.myOrders*/}
				{/*	.slice()*/}
				{/*	.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))*/}
				{/*	.sort((a, b) => (a.status === "Active" && b.status !== "Active" ? -1 : 1))*/}
				{/*	.map((order) => (*/}
				{/*		<TableRow key={order.id}>*/}
				{/*			<TableText primary style={{ minWidth: 24 }}>*/}
				{/*				{dayjs.unix(order.timestamp).format("DD MMM YY, HH:mm")}*/}
				{/*			</TableText>*/}
				{/*			<TableText primary>{order.market}</TableText>*/}
				{/*			<TableText primary>{order.status}</TableText>*/}
				{/*			<TableText color={order.type === "SELL" ? theme.colors.redLight : theme.colors.greenLight}>*/}
				{/*				{order.type}*/}
				{/*			</TableText>*/}
				{/*			<TableText primary>*/}
				{/*				{order.amountStr}*/}
				{/*				&nbsp;*/}
				{/*				<Chip>{order.type === "SELL" ? vm.token0.symbol : vm.token1.symbol}</Chip>*/}
				{/*			</TableText>*/}
				{/*			/!*<TableText>*!/*/}
				{/*			/!*	{order.total}*!/*/}
				{/*			/!*	<Chip>{order.type === "SELL" ? vm.token1.symbol : vm.token0.symbol}</Chip>*!/*/}
				{/*			/!*</TableText>*!/*/}
				{/*			<TableText primary>{order.fulfilled0.div(order.amount0).times(100).toFormat(2)}%</TableText>*/}
				{/*			<TableText primary>{order.price.toFixed(2)}</TableText>*/}
				{/*			<TableText>*/}
				{/*				{order.status === "Active" && (*/}
				{/*					<Row justifyContent="flex-end">*/}
				{/*						<CancelButton onClick={() => vm.cancelOrder(order.orderId.toString())}>Cancel</CancelButton>*/}
				{/*					</Row>*/}
				{/*				)}*/}
				{/*			</TableText>*/}
				{/*		</TableRow>*/}
				{/*	))}*/}
			</TableBody>
		</Root>
	);
});
export default BottomTablesInterface;
