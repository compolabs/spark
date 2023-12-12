import styled from "@emotion/styled";
import { Column, DesktopRow, Row } from "@src/components/Flex";
import React, { useEffect, useState } from "react";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import { useTheme } from "@emotion/react";
import Button from "@components/Button";
import BN from "@src/utils/BN";
import arrow from "@src/assets/icons/arrowUp.svg";
import { observer } from "mobx-react";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
	display: flex;
	align-items: center;
	box-sizing: border-box;
	height: 50px;
	width: 100%;
	background: ${({ theme }) => theme.colors.bgSecondary};
	border-radius: 10px;
	flex-shrink: 0;
`;
const Icon = styled.img`
	border-radius: 50%;
`;

const MarketSelect = styled.div<{
	focused?: boolean;
	disabled?: boolean;
}>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 12px;
	box-sizing: border-box;
	flex: 2;
	max-width: 280px;
	height: 100%;

	.menu-arrow {
		cursor: pointer;
		transition: 0.4s;
		transform: ${({ focused }) => (focused ? "rotate(-180deg)" : "rotate(0deg)")};
	}

	:hover {
		.menu-arrow {
			transform: ${({ focused, disabled }) => (focused ? "rotate(-180)" : disabled ? "rotate(0deg)" : "rotate(-90deg)")};
		}
	}
`;

const MarketStatistics = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 8px;
	flex: 7;
	box-sizing: border-box;
	width: 100%;
`;

const PriceRow = styled(Row)`
	align-items: center;
	justify-content: flex-end;
	@media (min-width: 880px) {
		justify-content: flex-start;
	}
`;

interface IPerpMarketState {
	price: BN;
	priceChange?: BN;
	indexPrice: BN;
	fundingRate: BN;
	avgFunding: BN;
	openInterest: BN;
	dailyVolume: BN;
}

interface ISpotMarketState {
	price: BN;
	priceChange: BN;
	indexPrice?: BN;
	dailyVolume?: BN;
	dailyHigh: BN;
	dailyLow: BN;
	volumeAsset1: BN;
	volumeAsset0: BN;
}

const MarketStatisticsBar: React.FC<IProps> = observer(() => {
	const { tradeStore, oracleStore } = useStores();
	const theme = useTheme();
	const [perpStats, setPerpStats] = useState<IPerpMarketState | null>(null);
	const perpStatsArr = [
		{ title: "Index price", value: BN.formatUnits(oracleStore.tokenIndexPrice, 8).toFormat(2) },
		{ title: "Funding rate", value: "" },
		{ title: "Avg funding", value: "" },
		{ title: "Open interest", value: "" },
		{ title: "24h volume", value: "" },
	];
	const [spotStats, setSpotStats] = useState<ISpotMarketState | null>(null);
	const spotStatsArr = [
		{ title: "Index price", value: BN.formatUnits(oracleStore.tokenIndexPrice, 8).toFormat(2) },
		{ title: "24h volume", value: "" },
		{ title: "24h High", value: "" },
		{ title: "24h Low", value: "" },
	];
	useEffect(() => {
		console.log("useEffect tradeStore.isMarketPerp", tradeStore.isMarketPerp);
		if (tradeStore.isMarketPerp) {
			setPerpStats({
				price: tradeStore.marketPrice,
				priceChange: BN.ZERO,
				indexPrice: BN.ZERO,
				fundingRate: BN.ZERO,
				avgFunding: BN.ZERO,
				openInterest: BN.ZERO,
				dailyVolume: BN.ZERO,
			});
		} else {
			// const to = dayjs().unix();
			// const from = to - 60 * 60 * 24 * 2;
			// const req = `https://spark-tv-datafeed.spark-defi.com/api/v1/history?symbol=UNI%2FUSDC&resolution=1D&from=${from}&to=${to}&countback=2&currencyCode=USDC`;
			// axios
			// 	.get(req)
			// 	.then((res) => res.data)
			// 	.then((data) => {
			// 		if (data.t[1] != null && data.t[0] != null) {
			// 			setSpotStats({
			// 				price: new BN(data.c[1]),
			// 				priceChange: data.c[0] === 0 ? BN.ZERO : new BN(new BN(data.c[1]).minus(data.c[0])).div(data.c[0]).times(100),
			// 				dailyHigh: new BN(data.h[1] ?? BN.ZERO),
			// 				dailyLow: new BN(data.l[1] ?? BN.ZERO),
			// 				//fixme
			// 				volumeAsset1: BN.formatUnits(data.v[1] * data.c[1], 9), //data.c[1] = price of USDC
			// 				volumeAsset0: BN.formatUnits(data.v[1] * 1, 9), //1 = price of USDC
			// 			});
			// 		} else if (data.h[0] != null && data.h[1] == null) {
			// 			setSpotStats({
			// 				price: new BN(data.c[0]),
			// 				priceChange: new BN(new BN(data.c[1]).minus(data.c[0])).div(data.c[0]).times(100),
			// 				dailyHigh: new BN(data.h[0]),
			// 				dailyLow: new BN(data.l[0]),
			// 				//fixme
			// 				volumeAsset1: BN.formatUnits(data.v[0] * data.c[0], 9), //data.c[1] = price of USDC
			// 				volumeAsset0: BN.formatUnits(data.v[0] * 1, 9), //1 = price of USDC
			// 			});
			// 		}
			// 	});
		}
	}, [tradeStore.isMarketPerp, tradeStore.marketPrice]);
	return (
		<Root>
			<MarketSelect
				focused={tradeStore.marketSelectionOpened}
				style={tradeStore.marketSelectionOpened ? { background: "#1B1B1B", borderRadius: "10px 0 0 10px" } : {}}
			>
				<Row alignItems="center">
					<Icon style={{ width: 24, height: 24 }} src={tradeStore.market?.token0.logo} alt="token0" />
					<Icon style={{ width: 24, height: 24, marginLeft: -8 }} src={tradeStore.market?.token1.logo} alt="token1" />
					<SizedBox width={8} />
					<Text type={TEXT_TYPES.H} primary>
						{tradeStore.market?.symbol}
					</Text>
				</Row>
				<SizedBox width={10} />
				<img
					onClick={() => !tradeStore.marketSelectionOpened && tradeStore.setMarketSelectionOpened(true)}
					style={{ width: 24, height: 24, marginLeft: -8 }}
					src={arrow}
					alt="arrow"
					className="menu-arrow"
				/>
			</MarketSelect>
			<MarketStatistics>
				<PriceRow alignItems="center">
					<Column alignItems="flex-end">
						<Text
							type={TEXT_TYPES.BODY}
							// style={{ color: state.priceChange?.gt(0) ? theme.colors.greenLight : theme.colors.redLight }}
						>
							{tradeStore.isMarketPerp ? perpStats?.priceChange?.toFormat(2) : spotStats?.priceChange?.toFormat(2)}
						</Text>
						<Text type={TEXT_TYPES.H} primary>
							$ {tradeStore.isMarketPerp ? perpStats?.price.toFormat(2) : spotStats?.price.toFormat(4)}
						</Text>
					</Column>
					<DesktopRow>
						{(tradeStore.isMarketPerp ? perpStatsArr : spotStatsArr).map(({ title, value }) => (
							<React.Fragment key={title}>
								<SizedBox width={1} height={30} style={{ background: theme.colors.bgPrimary, margin: "0 8px" }} />
								<Column>
									<Text type={TEXT_TYPES.SUPPORTING}>{title}</Text>
									<SizedBox height={4} />
									<Text type={TEXT_TYPES.BODY} primary>
										{value}
									</Text>
								</Column>
							</React.Fragment>
						))}
					</DesktopRow>
				</PriceRow>
				<DesktopRow>
					<Button text fitContent>
						SEE ALL MARKET DETAILS
					</Button>
				</DesktopRow>
			</MarketStatistics>
		</Root>
	);
});
export default MarketStatisticsBar;
