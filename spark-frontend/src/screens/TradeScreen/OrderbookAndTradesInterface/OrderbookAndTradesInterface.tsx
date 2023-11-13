import styled from "@emotion/styled";
import React, { useState } from "react";
import OrderBook from "@screens/TradeScreen/OrderbookAndTradesInterface/OrderBook";
import SizedBox from "@components/SizedBox";
import Button, { ButtonGroup } from "@components/Button";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	padding: 12px 0;
	flex: 2;
	max-width: 280px;
	height: 100%;
	border-radius: 10px;
	background: ${({ theme }) => theme.colors.gray4};
`;

const OrderbookAndTradesInterface: React.FC<IProps> = () => {
	const [isOrderbook, setIsOrderbook] = useState(true);
	return (
		<Root>
			<ButtonGroup style={{ padding: "0 12px" }}>
				<Button active onClick={() => setIsOrderbook(true)}>
					Orderbook
				</Button>
				<Button disabled onClick={() => setIsOrderbook(false)}>
					Trades
				</Button>
			</ButtonGroup>
			<SizedBox height={8} />
			{isOrderbook ? <OrderBook /> : null}
		</Root>
	);
};
export default OrderbookAndTradesInterface;
