import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import React from "react";
import SizedBox from "@components/SizedBox";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import Text, { TEXT_TYPES } from "@components/Text";
import { useTheme } from "@emotion/react";
import Button from "@components/Button";

interface IProps {}

const Root = styled.div`
	display: flex;
	align-items: center;
	box-sizing: border-box;
	height: 50px;
	width: 100%;
	background: ${({ theme }) => theme.colors.gray4};
	border-radius: 10px;
	flex-shrink: 0;
`;

const MarketSelect = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	box-sizing: border-box;
	flex: 2;
	height: 100%;
`;

const MarketStatistics = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16px;
	flex: 7;
	box-sizing: border-box;
	width: 100%;
`;

const MarketStatisticsBar: React.FC<IProps> = () => {
	const theme = useTheme();
	return (
		<Root>
			<MarketSelect>
				<Row alignItems="center">
					<img style={{ width: 24, height: 24 }} src={TOKENS_BY_SYMBOL.UNI.logo} alt="btc" />
					<img style={{ width: 24, height: 24, marginLeft: -8 }} src={TOKENS_BY_SYMBOL.USDC.logo} alt="btc" />
					<SizedBox width={8} />
					<Text type={TEXT_TYPES.H1}>UNI / USDC</Text>
				</Row>
				{/*<h4 style={{ transform: "rotate(90deg)" }}>{">"}</h4>*/}
			</MarketSelect>
			<SizedBox width={1} height={32} style={{ background: theme.colors.gray5 }} />
			<MarketStatistics>
				<Row alignItems="center">
					<Column alignItems="flex-end">
						<Text type={TEXT_TYPES.NUMBER_LARGE}>$ 25 000,00</Text>
						<Text type={TEXT_TYPES.NUMBER_SMALL} color={theme.colors.green}>
							+2.22 %
						</Text>
					</Column>
					<SizedBox width={12} />
					<SizedBox width={1} height={32} style={{ background: theme.colors.gray5 }} />
					<SizedBox width={12} />
					<Column>
						<Text type={TEXT_TYPES.LABEL} color={theme.colors.gray2}>
							Market price
						</Text>
						<SizedBox height={4} />
						<Text type={TEXT_TYPES.NUMBER_SMALL}>$ 25 000,00</Text>
					</Column>
					<SizedBox width={12} />
					<SizedBox width={1} height={32} style={{ background: theme.colors.gray5 }} />
					<SizedBox width={12} />
					<Column>
						<Text type={TEXT_TYPES.LABEL} color={theme.colors.gray2}>
							Volume
						</Text>
						<SizedBox height={4} />
						<Text type={TEXT_TYPES.NUMBER_SMALL}>250,000k</Text>
					</Column>
				</Row>
				<Button fitContent outline>
					SEE ALL MARKET DETAILS
				</Button>
			</MarketStatistics>
		</Root>
	);
};
export default MarketStatisticsBar;
