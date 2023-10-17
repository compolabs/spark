import styled from "@emotion/styled";
import React, { useState } from "react";
import DesktopOrderBook from "@screens/TradeScreen/OrderbookAndTradesInterface/DesktopOrderBook";
import SizedBox from "@components/SizedBox";
import Button, { ButtonGroup } from "@components/Button";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	padding: 16px 0;
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
			<ButtonGroup style={{ padding: "0 16px" }}>
				<Button outline={!isOrderbook} onClick={() => setIsOrderbook(true)}>
					Orderbook
				</Button>
				<Button disabled outline={isOrderbook} onClick={() => setIsOrderbook(false)}>
					Trades
				</Button>
			</ButtonGroup>
			<SizedBox height={16} />
			{isOrderbook ? <DesktopOrderBook /> : null}
		</Root>
	);
};
export default OrderbookAndTradesInterface;
