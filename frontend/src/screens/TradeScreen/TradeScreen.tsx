import styled from "@emotion/styled";
import React, { useState } from "react";
import MarketStatisticsBar from "@screens/TradeScreen/MarketStatisticsBar";
import { Column, Row } from "@src/components/Flex";
import Chart from "@screens/TradeScreen/Chart";
import BottomTablesInterface from "@screens/TradeScreen/BottomTablesInterface";
import StatusBar from "@screens/TradeScreen/StatusBar";
import { TradeScreenVMProvider } from "@screens/TradeScreen/TradeScreenVm";
import SizedBox from "@components/SizedBox";
import { useStores } from "@stores";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@src/constants";
import { observer } from "mobx-react";
import useWindowSize from "@src/hooks/useWindowSize";
import Button from "@components/Button";
import Dialog from "@components/Dialog";
import LeftBlock from "src/screens/TradeScreen/LeftBlock.tsx";
import OrderBook from "./OrderbookAndTradesInterface/OrderBook";
import OrderbookAndTradesInterface from "./OrderbookAndTradesInterface/OrderbookAndTradesInterface";
import { PerpTradeVMProvider } from "@screens/TradeScreen/PerpTradeVm";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	flex: 1;
	box-sizing: border-box;
	padding: 0 12px;
`;

const MobileCreateOrderDialogContainer = styled(Column)`
	width: 100%;

	& > * {
		width: 100%;
		flex: 1;
		height: 100%;
	}
`;

const TradeScreenImpl: React.FC<IProps> = observer(() => {
	const { referralStore } = useStores();
	const width = useWindowSize().width;
	const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
	if (!referralStore.access) return <Navigate to={ROUTES.REFERRAL} />;
	return width && width >= 880 ? (
		<Root>
			<MarketStatisticsBar />
			<SizedBox height={4} />
			<Row mainAxisSize="stretch" crossAxisSize="max">
				<LeftBlock />
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
			<SizedBox height={4} />
			<Column mainAxisSize="stretch" crossAxisSize="max" style={{ flex: 5 }}>
				<Chart />
				<BottomTablesInterface />
			</Column>
			<SizedBox height={16} />
			<Button green onClick={() => setCreateOrderDialogOpen(true)}>
				Create order
			</Button>
			<StatusBar />
			<Dialog visible={createOrderDialogOpen} onClose={() => setCreateOrderDialogOpen(false)}>
				<MobileCreateOrderDialogContainer>
					<OrderBook mobileMode />
					<LeftBlock style={{ maxWidth: "100%", height: "100%" }} />
				</MobileCreateOrderDialogContainer>
			</Dialog>
		</Root>
	);
});

const TradeScreen: React.FC<IProps> = () => {
	const { tradeStore, settingsStore } = useStores();
	const { marketId } = useParams<{ marketId: string }>();
	const market = tradeStore.marketsConfig[marketId ?? ""];
	const navigate = useNavigate();
	if (market == null) {
		navigate({
			pathname: `${ROUTES.TRADE}/${tradeStore.defaultMarketSymbol}`,
		});
	} else {
		tradeStore.setMarketSymbol(market.symbol);
	}
	return (
		<PerpTradeVMProvider>
			<TradeScreenVMProvider>
				<TradeScreenImpl />
			</TradeScreenVMProvider>
		</PerpTradeVMProvider>
	);
};
export default TradeScreen;
