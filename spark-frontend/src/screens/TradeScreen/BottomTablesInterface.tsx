import styled from "@emotion/styled";
import { Row } from "@src/components/Flex";
import React from "react";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import SizedBox from "@components/SizedBox";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
import Button from "@components/Button";

interface IProps {}

const Root = styled.div`
	display: flex;
	width: 100%;
	padding: 16px;
	flex-direction: column;
	box-sizing: border-box;
	flex: 1;
	border-radius: 10px;
	border: 1px solid #fff;
`;

const BottomTablesInterface: React.FC<IProps> = observer(() => {
	const { ordersStore } = useStores();
	const vm = useTradeScreenVM();
	return (
		<Root>
			<Row>
				<div style={{ flex: 1 }}>
					<b>Date</b>
				</div>
				<div style={{ flex: 1 }}>
					<b>Pair</b>
				</div>
				<div style={{ flex: 1 }}>
					<b>Type</b>
				</div>
				<div style={{ flex: 1 }}>
					<b>Price</b>
				</div>
				<div style={{ flex: 1 }}>
					<b>Amount</b>
				</div>
				<div style={{ flex: 1 }}>
					<b>Total</b>
				</div>
				<div style={{ flex: 1 }}>
					<b>Status</b>
				</div>
				<div style={{ flex: 1 }}>
					<b>Action</b>
				</div>
			</Row>
			<SizedBox height={16} />
			{ordersStore.myOrders.map((order) => (
				<Row key={order.id} style={{ marginBottom: 4, height: 18 }}>
					{/*<div style={{flex: 1}}>{order.timestamp}</div>*/}
					<div style={{ flex: 1, fontSize: 13 }}>{order.market}</div>
					<div style={{ flex: 1, fontSize: 13 }}>{order.type}</div>
					<div style={{ flex: 1, fontSize: 13 }}>{order.price.toFixed(2)}</div>
					<div style={{ flex: 1, fontSize: 13 }}>{order.amount}</div>
					<div style={{ flex: 1, fontSize: 13 }}>{order.total}</div>
					<div style={{ flex: 1, fontSize: 13 }}>{order.status}</div>
					<div style={{ flex: 1, fontSize: 13 }}>
						{order.status === "Active" && <Button onClick={() => vm.cancelOrder(order.orderId.toString())}>Cancel</Button>}
					</div>
				</Row>
			))}
		</Root>
	);
});
export default BottomTablesInterface;
