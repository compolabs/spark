import styled from "@emotion/styled";
import React, { useState } from "react";
import SpotOrderBook from "@screens/TradeScreen/OrderbookAndTradesInterface/SpotOrderBook";
import SizedBox from "@components/SizedBox";
import Button, { ButtonGroup } from "@components/Button";
import SpotTrades from "@screens/TradeScreen/OrderbookAndTradesInterface/SpotTrades";
import { OrderbookAndTradesInterfaceVMProvider } from "@screens/TradeScreen/OrderbookAndTradesInterface/OrderbookAndTradesInterfaceVM";

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
	background: ${({ theme }) => theme.colors.bgSecondary};
`;

const OrderbookAndTradesInterfaceImpl: React.FC<IProps> = () => {
	const [isOrderbook, setIsOrderbook] = useState(true);
	return (
		<Root>
			<ButtonGroup style={{ padding: "0 12px" }}>
				<Button active={isOrderbook} onClick={() => setIsOrderbook(true)}>
					Orderbook
				</Button>
				<Button active={!isOrderbook} onClick={() => setIsOrderbook(false)}>
					Trades
				</Button>
			</ButtonGroup>
			<SizedBox height={8} />
			{isOrderbook ? <SpotOrderBook /> : <SpotTrades />}
		</Root>
	);
};

const OrderbookAndTradesInterface: React.FC<IProps> = () => (
	<OrderbookAndTradesInterfaceVMProvider>
		<OrderbookAndTradesInterfaceImpl />
	</OrderbookAndTradesInterfaceVMProvider>
);

export default OrderbookAndTradesInterface;
