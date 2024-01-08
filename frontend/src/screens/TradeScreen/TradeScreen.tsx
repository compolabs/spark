import styled from "@emotion/styled";
import React, { useEffect } from "react";
import MarketStatisticsBar from "@screens/TradeScreen/MarketStatisticsBar";
import { Column, Row } from "@src/components/Flex";
import StatusBar from "@screens/TradeScreen/StatusBar";
import SizedBox from "@components/SizedBox";
import { useStores } from "@stores";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react";
import useWindowSize from "@src/hooks/useWindowSize";
import LeftBlock from "src/screens/TradeScreen/LeftBlock.tsx";
import OrderbookAndTradesInterface from "./OrderbookAndTradesInterface/OrderbookAndTradesInterface";
import { PerpTradeVMProvider } from "@screens/TradeScreen/PerpTradeVm";
import Text, { TEXT_TYPES } from "@components/Text";
import { SpotTradeVMProvider } from "@screens/TradeScreen/SpotTradeVm";
import BottomTablesInterfacePerp from "./BottomTablesInterfacePerp";
import BottomTablesInterfaceSpot from "./BottomTablesInterfaceSpot";
import Chart from "@screens/TradeScreen/Chart";
import Button from "@components/Button";
import Dialog from "@components/Dialog";
import SpotOrderBook from "@screens/TradeScreen/OrderbookAndTradesInterface/SpotOrderBook";


interface IProps {
}

const Root = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    flex: 1;
    box-sizing: border-box;
    padding: 0 12px;

    @media (max-width: 880px) {
								margin-top: 8px;
        padding: 0 4px;
    }
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
	const width = useWindowSize().width;
	const { tradeStore } = useStores();
	useEffect(() => {
		document.title = `Spark | ${tradeStore.marketSymbol}`;
	}, [tradeStore.marketSymbol]);
	return width && width >= 880 ? (
		<Root>
			<MarketStatisticsBar />
			<SizedBox height={4} />
			<Row mainAxisSize="stretch" crossAxisSize="max">
				<LeftBlock />
				<SizedBox width={4} />
				<Column mainAxisSize="stretch" crossAxisSize="max" style={{ flex: 5 }}>
					<Chart />
					{tradeStore.isMarketPerp ? <BottomTablesInterfacePerp /> : <BottomTablesInterfaceSpot />}
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
			{/*<Chart />*/}
			{/*<BottomTablesInterfacePerp />*/}
			<Row>
				<OrderbookAndTradesInterface />
				<SizedBox width={8} />
				<LeftBlock />
			</Row>
			<SizedBox height={8} />
			{tradeStore.isMarketPerp ? <BottomTablesInterfacePerp /> : <BottomTablesInterfaceSpot />}
			<SizedBox height={16} />
			<Dialog>
				<MobileCreateOrderDialogContainer>
					<SpotOrderBook mobileMode />
					<LeftBlock style={{ maxWidth: "100%", height: "100%" }} />
				</MobileCreateOrderDialogContainer>
			</Dialog>
		</Root>
	);
});
/*<Button green onClick={() => setCreateOrderDialogOpen(true)}>*/

/*	Create order*/

/*</Button>*/
/*<Dialog visible={createOrderDialogOpen} onClose={() => setCreateOrderDialogOpen(false)}>*/


const TradeScreen: React.FC<IProps> = observer(() => {
	const { tradeStore } = useStores();
	const { marketId } = useParams<{ marketId: string }>();
	const market = tradeStore.marketsConfig[marketId ?? ""];
	tradeStore.setMarketSymbol(market == null ? tradeStore.defaultMarketSymbol : market.symbol);
	return (
		<PerpTradeVMProvider>
			<SpotTradeVMProvider>
				<TradeScreenImpl />
			</SpotTradeVMProvider>
		</PerpTradeVMProvider>
	);
});
export default TradeScreen;
