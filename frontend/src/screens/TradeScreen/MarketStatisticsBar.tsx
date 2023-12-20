import styled from "@emotion/styled";
import { Column, DesktopRow, Row } from "@src/components/Flex";
import React, { useEffect, useState } from "react";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import { useTheme } from "@emotion/react";
import BN from "@src/utils/BN";
import arrow from "@src/assets/icons/arrowUp.svg";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import { usePerpTradeVM } from "@screens/TradeScreen/PerpTradeVm";
import { getLatestSpotTradePrice } from "@src/services/SpotMarketService";

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

const MarketStatisticsBar: React.FC<IProps> = observer(() => {
	const { tradeStore, oracleStore } = useStores();
	const theme = useTheme();
	const vm = usePerpTradeVM();
	const [price, setPrice] = useState<string | null>(null);
	const perpStatsArr = [
		{ title: "Index price", value: BN.formatUnits(oracleStore.tokenIndexPrice, 6).toFormat(2) },
		{ title: "Predicted Funding rate", value: tradeStore.fundingRate.toFormat(5) + " %" },
		{ title: "Open interest", value: vm?.openInterest == null ? "0.00" : vm.openInterest.toFormat(0) + " K" },
	];
	const spotStatsArr = [
		{ title: "Index price", value: BN.formatUnits(oracleStore.tokenIndexPrice, 6).toFormat(2) },
		// { title: "24h volume", value: "" },
		// { title: "24h High", value: "" },
		// { title: "24h Low", value: "" },
	];
	useEffect(() => {
		console.log("tradeStore.isMarketPerp", tradeStore.isMarketPerp);
		if (tradeStore.isMarketPerp && tradeStore.marketSymbol != null) {
			console.log("1");
			setPrice(BN.formatUnits(tradeStore.marketPrice, 6).toFormat(2));
		} else {
			console.log("2");
			const asset0 = tradeStore.market?.token0.assetId.slice(2) ?? "";
			const asset1 = tradeStore.market?.token1.assetId.slice(2) ?? "";
			getLatestSpotTradePrice(asset0, asset1).then((v) => setPrice(v.toFormat(2)));
		}
	}, [
		tradeStore.marketPrice,
		// tradeStore.marketSymbol,
		tradeStore.isMarketPerp,
		// tradeStore.market?.token0.assetId,
		// tradeStore.market?.token1.assetId,
	]);
	return (
		<Root>
			<MarketSelect
				focused={tradeStore.marketSelectionOpened}
				style={tradeStore.marketSelectionOpened ? { background: "#1B1B1B", borderRadius: "10px 0 0 10px" } : {}}
				onClick={() => !tradeStore.marketSelectionOpened && tradeStore.setMarketSelectionOpened(true)}
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
				<img style={{ width: 24, height: 24, marginLeft: -8 }} src={arrow} alt="arrow" className="menu-arrow" />
			</MarketSelect>
			<MarketStatistics>
				<PriceRow alignItems="center">
					<Column alignItems="flex-end">
						{/*<Text*/}
						{/*	type={TEXT_TYPES.BODY}*/}
						{/*	style={{ color: state.priceChange?.gt(0) ? theme.colors.greenLight : theme.colors.redLight }}*/}
						{/*>*/}
						{/*	{tradeStore.isMarketPerp ? perpStats?.priceChange?.toFormat(2) : spotStats?.priceChange?.toFormat(2)}*/}
						{/*</Text>*/}
						<Text type={TEXT_TYPES.H} primary>
							$ {price}
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
			</MarketStatistics>
		</Root>
	);
});
export default MarketStatisticsBar;
