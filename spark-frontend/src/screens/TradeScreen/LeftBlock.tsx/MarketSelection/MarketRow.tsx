import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import star from "@src/assets/icons/star.svg";
import yellowStar from "@src/assets/icons/yellowStar.svg";
import { SpotMarket } from "@src/entity";
import { useStores } from "@stores";

interface IProps {
	market: SpotMarket;
}

const Root = styled.div`
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

const MarketRow: React.FC<IProps> = observer(({ market }) => {
	const { tradeStore } = useStores();
	const navigate = useNavigate();
	const addedToFav = tradeStore.favMarkets.includes(market.symbol);
	return (
		<Root
			onClick={() => {
				tradeStore.setMarketSelectionOpened(false);
				navigate(`/${market.symbol}`);
			}}
		>
			<Row alignItems="center">
				<Column mainAxisSize="stretch">
					<Icon
						alt="star"
						src={addedToFav ? yellowStar : star}
						style={{ cursor: "pointer", zIndex: 100000 }}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							addedToFav ? tradeStore.removeFromFav(market.symbol) : tradeStore.addToFav(market.symbol);
						}}
					/>
					<SizedBox height={4} />
					<Row>
						<Icon alt="logo" src={market.baseToken?.logo} />
						<Icon alt="logo" src={market.quoteToken?.logo} style={{ left: "-6px", position: "relative" }} />
					</Row>
				</Column>
				<SizedBox width={4} />
				{/*todo символ ниже чем иконки, см дизайн https://www.figma.com/file/n2x2dfjwCzE4Wy70J3rzti/Spark-redesign?type=design&node-id=49-8345&mode=design&t=IwyRKFW5pCeNNCX8-4*/}
				<Column
					mainAxisSize="stretch"
					onClick={() => {
						tradeStore.setMarketSelectionOpened(false);
						navigate(`/${market.symbol}`);
					}}
				>
					{/*{market.leverage != null ? <Leverage>{`${market.leverage}x`}</Leverage> : <></>}*/}
					<SizedBox height={4} />
					<Text color="primary" type={TEXT_TYPES.H}>
						{market.symbol}
					</Text>
				</Column>
			</Row>
			<Column alignItems="end">
				<Text color="primary" type={TEXT_TYPES.H} nowrap>
					$ {market.priceUnits.toFormat(2)}
				</Text>
			</Column>
		</Root>
	);
});
export default MarketRow;
