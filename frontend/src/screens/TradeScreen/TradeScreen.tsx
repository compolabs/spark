import styled from "@emotion/styled";
import React, { useState } from "react";
import MarketStatisticsBar from "@screens/TradeScreen/MarketStatisticsBar";
import { Column, Row } from "@src/components/Flex";
import CreateOrderInterface from "@screens/TradeScreen/CreateOrderInterface";
import Chart from "@screens/TradeScreen/Chart";
import BottomTablesInterface from "@screens/TradeScreen/BottomTablesInterface";
import OrderbookAndTradesInterface from "@screens/TradeScreen/OrderbookAndTradesInterface";
import StatusBar from "@screens/TradeScreen/StatusBar";
import { TradeScreenVMProvider } from "@screens/TradeScreen/TradeScreenVm";
import SizedBox from "@components/SizedBox";
import { useStores } from "@stores";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@src/constants";
import { observer } from "mobx-react";
import useWindowSize from "@src/hooks/useWindowSize";
import Button from "@components/Button";
import Dialog from "@components/Dialog";
import OrderBook from "@screens/TradeScreen/OrderbookAndTradesInterface/OrderBook";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	flex: 1;
	box-sizing: border-box;
	padding: 0 4px;
	@media (min-width: 880px) {
		padding: 0 12px;
	}
`;

// const MobileCreateOrderDialogContainer = styled(Column)`
// 	width: 100%;
//
// 	& > * {
// 		width: 100%;
// 		flex: 1;
// 		height: 100%;
// 	}
// `;

const MobileOrderBookContainer = styled.div`
	background: ${({ theme }) => theme.colors.bgSecondary};
	border-radius: 10px;
`;

const TradeScreenImpl: React.FC<IProps> = observer(() => {
	const { referralStore } = useStores();
	const width = useWindowSize().width;
	// const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
	if (!referralStore.access) return <Navigate to={ROUTES.REFERRAL} />;
	return width && width >= 880 ? (
		<Root>
			<MarketStatisticsBar />
			<SizedBox height={4} />
			<Row mainAxisSize="stretch" crossAxisSize="max">
				<CreateOrderInterface />
				<SizedBox width={4} />
				<Column mainAxisSize="stretch" crossAxisSize="max" style={{ flex: 5 }}>
					<Chart />
					<BottomTablesInterface />
				</Column>
				<SizedBox width={4} />
				<OrderbookAndTradesInterface />
			</Row>
			<SizedBox height={4} />
			<StatusBar />
		</Root>
	) : (
		<Root>
			<MarketStatisticsBar />
			<SizedBox height={8} />
			<Row>
				<MobileOrderBookContainer>
					<OrderBook />
				</MobileOrderBookContainer>
				<SizedBox width={8} />
				<CreateOrderInterface />
			</Row>
			{/*<Column mainAxisSize="stretch" crossAxisSize="max" style={{ flex: 5 }}>*/}
			{/*	<Chart />*/}
			{/*	<BottomTablesInterface />*/}
			{/*</Column>*/}
			{/*<SizedBox height={16} />*/}
			{/*<Button green onClick={() => setCreateOrderDialogOpen(true)}>*/}
			{/*	Create order*/}
			{/*</Button>*/}
			{/*<StatusBar/>*/}
			{/*<Dialog visible={createOrderDialogOpen} onClose={() => setCreateOrderDialogOpen(false)}>*/}
			{/*	<MobileCreateOrderDialogContainer>*/}
			{/*		<OrderBook mobileMode />*/}
			{/*		<CreateOrderInterface style={{ maxWidth: "100%", height: "100%" }} />*/}
			{/*	</MobileCreateOrderDialogContainer>*/}
			{/*</Dialog>*/}
		</Root>
	);
});

const TradeScreen: React.FC<IProps> = () => {
	return (
		<TradeScreenVMProvider>
			<TradeScreenImpl />
		</TradeScreenVMProvider>
	);
};
export default TradeScreen;
