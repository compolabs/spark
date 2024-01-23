import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import LeftBlock from "src/screens/TradeScreen/LeftBlock.tsx";

import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import BottomTables from "@screens/TradeScreen/BottomTables";
import Chart from "@screens/TradeScreen/Chart";
import { CreateOrderSpotVMProvider } from "@screens/TradeScreen/LeftBlock.tsx/CreateOrderSpot/CreateOrderSpotVM";
import MarketStatisticsBar from "@screens/TradeScreen/MarketStatisticsBar";
import StatusBar from "@screens/TradeScreen/StatusBar";
import { Column, Row } from "@src/components/Flex";
import useWindowSize from "@src/hooks/useWindowSize";
import { useStores } from "@stores";

import OrderbookAndTradesInterface from "./OrderbookAndTradesInterface/OrderbookAndTradesInterface";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	flex: 1;
	box-sizing: border-box;
	padding: 0 12px;
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

const TradeScreenImpl: React.FC<IProps> = observer(() => {
	const width = useWindowSize().width;
	const { tradeStore } = useStores();
	useEffect(() => {
		document.title = `Spark | ${tradeStore.marketSymbol}`;
	}, [tradeStore.marketSymbol]);
	return width && width >= 880 ? (
		<Root>
			<MarketStatisticsBar />
			<SizedBox height={4} />
			<Row crossAxisSize="max" mainAxisSize="stretch">
				<LeftBlock />
				<SizedBox width={4} />
				<Column crossAxisSize="max" mainAxisSize="stretch" style={{ flex: 5 }}>
					<Chart />
					<BottomTables />
				</Column>
				<SizedBox width={4} />
				<OrderbookAndTradesInterface />
			</Row>
			<SizedBox height={4} />
			<StatusBar />
		</Root>
	) : (
		<Root>
			{/*todo мобильный интерфейс*/}
			<Text type={TEXT_TYPES.BUTTON_SECONDARY}>Page under construction. Please use a desktop device.</Text>
			{/*<MarketStatisticsBar />*/}
			{/*<SizedBox height={4} />*/}
			{/*<Column mainAxisSize="stretch" crossAxisSize="max" style={{ flex: 5 }}>*/}
			{/*	<Chart />*/}
			{/*	<BottomTablesInterface />*/}
			{/*</Column>*/}
			{/*<SizedBox height={16} />*/}
			{/*<Button green onClick={() => setCreateOrderDialogOpen(true)}>*/}
			{/*	Create order*/}
			{/*</Button>*/}
			{/*<StatusBar />*/}
			{/*<Dialog visible={createOrderDialogOpen} onClose={() => setCreateOrderDialogOpen(false)}>*/}
			{/*	<MobileCreateOrderDialogContainer>*/}
			{/*		<SpotOrderBook mobileMode />*/}
			{/*		<LeftBlock style={{ maxWidth: "100%", height: "100%" }} />*/}
			{/*	</MobileCreateOrderDialogContainer>*/}
			{/*</Dialog>*/}
		</Root>
	);
});

const TradeScreen: React.FC<IProps> = observer(() => {
	const { tradeStore } = useStores();
	const { marketId } = useParams<{ marketId: string }>();
	const spotMarketExists = tradeStore.spotMarkets.some((market) => market.symbol === marketId);
	tradeStore.setMarketSymbol(!marketId || !spotMarketExists ? tradeStore.defaultMarketSymbol : marketId);

	return (
		//я оборачиваю весь TradeScreenImpl в CreateOrderSpotVMProvider потому что при нажатии на трейд в OrderbookAndTradesInterface должно меняться значение в LeftBlock
		<CreateOrderSpotVMProvider>
			<TradeScreenImpl />
		</CreateOrderSpotVMProvider>
	);
});
export default TradeScreen;
