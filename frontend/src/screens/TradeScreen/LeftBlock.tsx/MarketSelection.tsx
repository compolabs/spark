import styled from "@emotion/styled";
import React, { useRef, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import useOnClickOutside from "@src/hooks/useOnClickOutside";
import BN from "@src/utils/BN";

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

	:hover {
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
	const { tradeStore, oracleStore } = useStores();
	const [searchValue, setSearchValue] = useState<string>("");
	const navigate = useNavigate();
	const ref = useRef(null);
	const [isSpotMarket, setSpotMarket] = useState(!tradeStore.isMarketPerp);

	const filteredPerpMarkets = tradeStore.perpMarkets.filter(({ token0, token1 }) =>
		searchValue
			? [token0.symbol, token1.symbol].map((v) => v.toLowerCase()).some((v) => v.includes(searchValue.toLowerCase()))
			: true,
	);
	const filteredSpotMarkets = tradeStore.spotMarkets.filter(({ token0, token1 }) =>
		searchValue
			? [token0.symbol, token1.symbol].map((v) => v.toLowerCase()).some((v) => v.includes(searchValue.toLowerCase()))
			: true,
	);
	useOnClickOutside(ref, () => tradeStore.setMarketSelectionOpened(false));
	return (
		<Root ref={ref}>
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
				<Text type={TEXT_TYPES.BODY}>MARKET</Text>
				<Text type={TEXT_TYPES.BODY}>PRICE</Text>
			</Row>
			<SizedBox height={12} />
			<Divider />
			{isSpotMarket && filteredSpotMarkets.length === 0 && (
				<>
					<SizedBox height={16} />
					<Row justifyContent="center">
						<Text>No spot markets found</Text>
					</Row>
				</>
			)}
			{!isSpotMarket && filteredPerpMarkets.length === 0 && (
				<>
					<SizedBox height={16} />
					<Row justifyContent="center">
						<Text>No perp markets found</Text>
					</Row>
				</>
			)}

			{(isSpotMarket ? filteredSpotMarkets : filteredPerpMarkets).map((market) => {
				const addedToFav = tradeStore.favMarkets.includes(market.symbol);
				const price = oracleStore.prices == null ? 0 : oracleStore.prices[market.token0.priceFeed]?.price;
				const formattedPrice = BN.formatUnits(price, 8).toFormat(2);
				return (
					<Market key={market.symbol}>
						<Row alignItems="center">
							<Column mainAxisSize="stretch">
								<Icon
									src={addedToFav ? yellowStar : star}
									alt="star"
									style={{ cursor: "pointer" }}
									onClick={() => (addedToFav ? tradeStore.removeFromFav(market.symbol) : tradeStore.addToFav(market.symbol))}
								/>
								<SizedBox height={4} />
								<Row>
									<Icon src={market.token0?.logo} alt="logo" />
									<Icon src={market.token1?.logo} alt="logo" style={{ left: "-6px", position: "relative" }} />
								</Row>
							</Column>
							<SizedBox width={4} />
							<Column
								mainAxisSize="stretch"
								onClick={() => {
									tradeStore.setMarketSelectionOpened(false);
									navigate(`/${market.symbol}`);
								}}
							>
								{market.leverage != null ? <Leverage>{`${market.leverage}x`}</Leverage> : <></>}
								<SizedBox height={4} />
								<Text type={TEXT_TYPES.H} color="primary">
									{market.symbol}
								</Text>
							</Column>
						</Row>
						<Column
							alignItems="end"
							onClick={() => {
								tradeStore.setMarketSelectionOpened(false);
								navigate(`/${market.symbol}`);
							}}
						>
							{/*<Text style={{ textAlign: "right" }} nowrap>*/}
							{/*	0.02%*/}
							{/*</Text>*/}
							<Text type={TEXT_TYPES.H} nowrap color="primary">
								$ {formattedPrice}
							</Text>
						</Column>
					</Market>
				);
			})}
		</Root>
	);
});

export default MarketSelection;
