import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import React from "react";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import dayjs from "dayjs";
import { useTheme } from "@emotion/react";
import Text from "@components/Text";
import Chip from "@src/components/Chip";
import Button from "@src/components/Button";

interface IProps {}

const Root = styled.div`
	background: ${({ theme }) => theme.colors.gray4};
	display: flex;
	width: 100%;
	flex-direction: column;
	box-sizing: border-box;
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

const Title = styled(Text)`
	${TEXT_TYPES_MAP[TEXT_TYPES.BODY_SMALL]}
	color: ${({ theme }) => theme.colors.gray2};
	flex: 1;
`;

const TitleRow = styled(Row)`
	height: 28px;
	flex-shrink: 0;
	align-items: center;
	padding: 0 12px;
	box-sizing: border-box;
`;
const TableText = styled(Text)`
	${TEXT_TYPES_MAP[TEXT_TYPES.H3]}
	flex: 1;
	display: flex;
	align-items: center;
`;

const TableRow = styled(Row)`
	margin-bottom: 10px;
	height: 32px;
	flex-shrink: 0;
	background: ${({ theme }) => theme.colors.gray5};
	align-items: center;
	padding: 0 12px;
	box-sizing: border-box;
`;

const Body = styled(Column)`
	overflow: scroll;
	width: 100%;
	box-sizing: border-box;
`;

const StyledButton = styled(Button)`
	font-size: 8px;
	height: 18px;
	padding: 0 8px;
`;

const BottomTablesInterface: React.FC<IProps> = observer(() => {
	const { ordersStore } = useStores();
	const theme = useTheme();
	const vm = useTradeScreenVM();

	return (
		<Root>
			<TitleRow>
				<Title>Date</Title>
				<Title>Pair</Title>
				<Title>Type</Title>
				<Title>Price</Title>
				<Title>Amount</Title>
				<Title>Total</Title>
				<Title>Status</Title>
				<Title>Action</Title>
			</TitleRow>
			<Body>
				{ordersStore.myOrders
					.slice()
					.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
					.sort((a, b) => (a.status === "Active" && b.status !== "Active" ? -1 : 1))
					.map((order) => (
						<TableRow key={order.id}>
							<TableText style={{ minWidth: 24 }}>{dayjs.unix(order.timestamp).format("DD MMM YY, HH:mm")}</TableText>
							<TableText>{order.market}</TableText>
							<TableText color={order.type === "SELL" ? theme.colors.red : theme.colors.green}>{order.type}</TableText>
							<TableText>{order.price.toFixed(2)}</TableText>
							<TableText>
								{order.amount}
								<Chip>{order.type === "SELL" ? vm.token0.symbol : vm.token1.symbol}</Chip>
							</TableText>
							<TableText>
								{order.total}
								<Chip>{order.type === "SELL" ? vm.token1.symbol : vm.token0.symbol}</Chip>
							</TableText>
							<TableText>{order.status}</TableText>
							<TableText>
								{order.status === "Active" && (
									<StyledButton secondary fitContent onClick={() => vm.cancelOrder(order.orderId.toString())}>
										Cancel
									</StyledButton>
								)}
							</TableText>
						</TableRow>
					))}
			</Body>
		</Root>
	);
});
export default BottomTablesInterface;
