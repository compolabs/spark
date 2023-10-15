import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import React from "react";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";

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
	//border: 1px solid #fff;
`;

const Title = styled.div`
	${TEXT_TYPES_MAP[TEXT_TYPES.BODY_SMALL]}
	color: ${({ theme }) => theme.colors.gray2};
	flex: 1;
`;

const TitleRow = styled(Row)`
	height: 28px;
	flex-shrink: 0;
	align-items: center;
	padding: 0 12px;
`;
const TableText = styled.div`
	${TEXT_TYPES_MAP[TEXT_TYPES.H3]}
	color: ${({ theme }) => theme.colors.white};
	flex: 1;
`;

const TableRow = styled(Row)`
	margin-bottom: 10px;
	height: 32px;
	flex-shrink: 0;
	background: ${({ theme }) => theme.colors.gray5};
	align-items: center;
	padding: 0 12px;
`;

const Body = styled(Column)`
	overflow: scroll;
	width: 100%;
`;

const BottomTablesInterface: React.FC<IProps> = observer(() => {
	const { ordersStore } = useStores();
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
				{ordersStore.myOrders.map((order) => (
					<TableRow key={order.id}>
						{/*<div style={{flex: 1}}>{order.timestamp}</div>*/}
						<TableText>-</TableText>
						<TableText>{order.market}</TableText>
						<TableText>{order.type}</TableText>
						<TableText>{order.price.toFixed(2)}</TableText>
						<TableText>{order.amount}</TableText>
						<TableText>{order.total}</TableText>
						<TableText>{order.status}</TableText>
						<TableText>
							{order.status === "Active" && <button onClick={() => vm.cancelOrder(order.id)}>Cancel</button>}
						</TableText>
					</TableRow>
				))}
			</Body>
		</Root>
	);
});
export default BottomTablesInterface;
