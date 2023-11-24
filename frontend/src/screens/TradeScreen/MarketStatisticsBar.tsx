import styled from "@emotion/styled";
import { Column, DesktopRow, Row } from "@src/components/Flex";
import React, { useEffect, useState } from "react";
import SizedBox from "@components/SizedBox";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import Text, { TEXT_TYPES } from "@components/Text";
import { useTheme } from "@emotion/react";
import Button from "@components/Button";
import dayjs from "dayjs";
import axios from "axios";
import BN from "@src/utils/BN";
import arrow from "@src/assets/icons/arrowUp.svg";
import { observer } from "mobx-react";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
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

interface IState {
	price?: BN;
	priceChange?: BN;
	high?: BN;
	low?: BN;
	volumeAsset0?: BN;
	volumeAsset1?: BN;
}

const PriceRow = styled(Row)`
	align-items: center;
	justify-content: flex-end;
	@media (min-width: 880px) {
		justify-content: flex-start;
	}
`;

const MarketStatisticsBar: React.FC<IProps> = observer(() => {
	const { settingsStore } = useStores();
	const vm = useTradeScreenVM();
	const theme = useTheme();
	let [state, setState] = useState<IState>({});
	useEffect(() => {
		const to = dayjs().unix();
		const from = to - 60 * 60 * 24 * 2;
		const req = `https://spark-tv-datafeed.spark-defi.com/api/v1/history?symbol=UNI%2FUSDC&resolution=1D&from=${from}&to=${to}&countback=2&currencyCode=USDC`;
		axios
			.get(req)
			.then((res) => res.data)
			.then((data) => {
				if (data.t[1] != null && data.t[0] != null) {
					setState({
						price: new BN(data.c[1]),
						priceChange: data.c[0] === 0 ? BN.ZERO : new BN(new BN(data.c[1]).minus(data.c[0])).div(data.c[0]).times(100),
						high: new BN(data.h[1] ?? BN.ZERO),
						low: new BN(data.l[1] ?? BN.ZERO),
						//fixme
						volumeAsset1: BN.formatUnits(data.v[1] * data.c[1], 9), //data.c[1] = price of USDC
						volumeAsset0: BN.formatUnits(data.v[1] * 1, 9), //1 = price of USDC
					});
				} else if (data.h[0] != null && data.h[1] == null) {
					setState({
						price: new BN(data.c[0]),
						// priceChange: new BN(new BN(data.c[1]).minus(data.c[0])).div(data.c[0]).times(100),
						high: new BN(data.h[0]),
						low: new BN(data.l[0]),
						//fixme
						volumeAsset1: BN.formatUnits(data.v[0] * data.c[0], 9), //data.c[1] = price of USDC
						volumeAsset0: BN.formatUnits(data.v[0] * 1, 9), //1 = price of USDC
					});
				}
			});
	}, []);
	return (
		<Root>
			<MarketSelect
				focused={settingsStore.marketSelectionOpened}
				style={settingsStore.marketSelectionOpened ? { background: "#1B1B1B" } : {}}
			>
				<Row alignItems="center">
					<img style={{ width: 24, height: 24 }} src={vm.token0.logo} alt="token0" />
					<img style={{ width: 24, height: 24, marginLeft: -8 }} src={vm.token1.logo} alt="token1" />
					<SizedBox width={8} />
					<Text type={TEXT_TYPES.H} primary>
						{`${vm.token0.symbol}-${vm.token1.symbol}`}
					</Text>
				</Row>
				<SizedBox width={10} />
				<img
					onClick={() => !settingsStore.marketSelectionOpened && settingsStore.setMarketSelectionOpened(true)}
					style={{ width: 24, height: 24, marginLeft: -8 }}
					src={arrow}
					alt="arrow"
					className="menu-arrow"
				/>
				{/*<h4 style={{ transform: "rotate(90deg)" }}>{">"}</h4>*/}
			</MarketSelect>
			<MarketStatistics>
				<PriceRow alignItems="center">
					<Column alignItems="flex-end">
						<Text
							type={TEXT_TYPES.BODY}
							style={{ color: state.priceChange?.gt(0) ? theme.colors.greenLight : theme.colors.redLight }}
						>
							{state.priceChange?.toFormat(2) ?? "-"}%
						</Text>
						<Text type={TEXT_TYPES.H} primary>
							{state.price?.toFormat(2) ?? "-"}&nbsp;{vm.token1.symbol}
						</Text>
					</Column>
					<DesktopRow>
						<SizedBox width={1} height={30} style={{ background: theme.colors.bgPrimary, margin: "0 8px" }} />
						<Column>
							<Text type={TEXT_TYPES.SUPPORTING}>24h High</Text>
							<SizedBox height={4} />
							<Text type={TEXT_TYPES.BODY} primary>
								{state.high?.toFormat(2) ?? "-"}&nbsp;{vm.token1.symbol}
							</Text>
						</Column>
						<SizedBox width={1} height={32} style={{ background: theme.colors.bgSecondary, margin: "0 8px" }} />{" "}
						<Column>
							<Text type={TEXT_TYPES.SUPPORTING}>24h Low</Text>
							<SizedBox height={4} />
							<Text type={TEXT_TYPES.BODY} primary>
								{state.low?.toFormat(2) ?? "-"}&nbsp;{vm.token1.symbol}
							</Text>
						</Column>
						<SizedBox width={1} height={32} style={{ background: theme.colors.bgSecondary, margin: "0 8px" }} />
						<Column>
							<Text type={TEXT_TYPES.SUPPORTING}>Volume 24h (USDC)</Text>
							<SizedBox height={4} />
							<Text type={TEXT_TYPES.BODY} primary>
								{state.volumeAsset1?.toFormat(2) ?? "-"}
							</Text>
						</Column>
						<SizedBox width={1} height={32} style={{ background: theme.colors.bgSecondary, margin: "0 8px" }} />
						<Column>
							<Text type={TEXT_TYPES.SUPPORTING}>Volume 24h (UNI)</Text>
							<SizedBox height={4} />
							<Text type={TEXT_TYPES.BODY} primary>
								{state.volumeAsset0?.toFormat(2) ?? "-"}
							</Text>
						</Column>
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
