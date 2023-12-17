import styled from "@emotion/styled";
import React, { useState } from "react";
import OrderBook from "@screens/TradeScreen/OrderbookAndTradesInterface/OrderBook";
import SizedBox from "@components/SizedBox";
import Button, { ButtonGroup } from "@components/Button";
import { useStores } from "@stores";
import PerpOrderBook from "@screens/TradeScreen/OrderbookAndTradesInterface/PerpOrderBook";
import PerpTrades from "@screens/TradeScreen/OrderbookAndTradesInterface/PerpTrades";
import SpotTrades from "@screens/TradeScreen/OrderbookAndTradesInterface/SpotTrades";

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

const OrderbookAndTradesInterface: React.FC<IProps> = () => {
	const { tradeStore } = useStores();
	const [isOrderbook, setIsOrderbook] = useState(false);
	return (
		<Root>
			<ButtonGroup style={{ padding: "0 12px" }}>
				<Button active onClick={() => setIsOrderbook(true)}>
					Orderbook
				</Button>
				<Button onClick={() => setIsOrderbook(false)}>Trades</Button>
			</ButtonGroup>
			<SizedBox height={8} />
			{isOrderbook ? tradeStore.isMarketPerp ? <PerpOrderBook /> : <OrderBook /> : null}
			{!isOrderbook ? tradeStore.isMarketPerp ? <PerpTrades /> : <SpotTrades /> : null}
		</Root>
	);
};
export default OrderbookAndTradesInterface;
