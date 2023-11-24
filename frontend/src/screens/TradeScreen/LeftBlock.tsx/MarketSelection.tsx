import styled from "@emotion/styled";
import React, { useState } from "react";
import Button, { ButtonGroup } from "@components/Button";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import SearchInput from "@components/SearchInput";
import { Column, Row } from "@components/Flex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import Divider from "@components/Divider";
import { useStores } from "@stores";
import star from "@src/assets/icons/star.svg";
import yellowStar from "@src/assets/icons/yellowStar.svg";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
`;
const Top = styled.div`
	display: flex;
	flex-direction: column;
	padding: 12px;
`;
const Market = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px;
	border-bottom: 1px solid ${({ theme }) => theme.colors.borderSecondary};
	box-sizing: border-box;
	cursor: pointer;
	:hover{
	 background: ${({ theme }) => theme.colors.borderSecondary};
	}
`;
const Icon = styled.img`
	height: 16px;
	width: 16px;
	border-radius: 50%;
`;
const Leverage = styled.div`
	${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]};
	color: ${({ theme }) => theme.colors.textSecondary};
	padding: 1px 3px;
	border-radius: 4px;
	border: 1px solid ${({ theme }) => theme.colors.borderAccent};
`;
const MarketSelection: React.FC<IProps> = observer(() => {
	const { marketsStore } = useStores();
	const [isSpotMarket, setSpotMarket] = useState(true);
	const [searchValue, setSearchValue] = useState<string>("");

	const markets = isSpotMarket ? marketsStore.spotMarkets : marketsStore.perpMarkets;
	const filteredMarkets = markets.filter(({ token0, token1 }) =>
		searchValue
			? [token0.symbol, token1.symbol].map((v) => v.toLowerCase()).some((v) => v.includes(searchValue.toLowerCase()))
			: true,
	);
	// const addToFav = (t0: string, t1: string, type: string) => {
	// 	marketsStore.favMarkets
	// };
	// const removeFromFav = (t0: string, t1: string, type: string) => {};
	return (
		<Root>
			<Top>
				<ButtonGroup>
					<Button active={isSpotMarket} onClick={() => setSpotMarket(true)}>
						SPOT
					</Button>
					<Button active={!isSpotMarket} onClick={() => setSpotMarket(false)}>
						PERP
					</Button>
				</ButtonGroup>
				<SizedBox height={16} />
				<SearchInput value={searchValue} onChange={(v) => setSearchValue(v)} />
			</Top>
			<SizedBox height={24} />
			<Row justifyContent="space-between" style={{ padding: "0 12px", boxSizing: "border-box" }}>
				<Text type={TEXT_TYPES.BODY}>MARKETS</Text>
				<Text type={TEXT_TYPES.BODY}>PRICE & 24h CHANGE</Text>
			</Row>
			<SizedBox height={12} />
			<Divider />
			{filteredMarkets.length == 0 ? (
				<>
					<SizedBox height={16} />
					<Row justifyContent="center">
						<Text>No markets found</Text>
					</Row>
				</>
			) : (
				filteredMarkets.map(({ token0, token1, leverage, price, change24, type }, index) => {
					const marketId = `${token0.symbol}-${token1.symbol}-${type}`;
					const addedToFav = marketsStore.favMarkets.includes(marketId);
					return (
						<Market key={token0.symbol + token1.symbol + index}>
							<Row alignItems="center" >
								<Column mainAxisSize="stretch">
									<Icon
										src={addedToFav ? yellowStar : star}
										alt="star"
										style={{ cursor: "pointer" }}
										onClick={() => (addedToFav ? marketsStore.removeFromFav(marketId) : marketsStore.addToFav(marketId))}
									/>
									<SizedBox height={4} />
									<Icon src={token0.logo} alt="logo" />
								</Column>
								<SizedBox width={4} />
								<Column  mainAxisSize="stretch">
									{leverage != null ? <Leverage>{`${leverage}x`}</Leverage> : <></>}
									<SizedBox height={4} />
									<Text type={TEXT_TYPES.H} color="primary">{`${token0.symbol}-${token1.symbol}`}</Text>
								</Column>
							</Row>
							<Column alignItems="end">
								<Text style={{ textAlign: "right" }} nowrap>
									0.02%
								</Text>
								<Text type={TEXT_TYPES.H} nowrap color="primary">
									$ 1,789.00
								</Text>
							</Column>
						</Market>
					);
				})
			)}
		</Root>
	);
});

export default MarketSelection;
