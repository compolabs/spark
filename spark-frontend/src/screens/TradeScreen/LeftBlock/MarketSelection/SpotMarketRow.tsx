import React, { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Text, { TEXT_TYPES } from "@components/Text";
import outlineStarIcon from "@src/assets/icons/star.svg";
import filledStarIcon from "@src/assets/icons/yellowStar.svg";
import { SmartFlex } from "@src/components/SmartFlex";
import { SpotMarket } from "@src/entity";
import { useStores } from "@stores";

interface IProps {
  market: SpotMarket;
}

const PerpMarketRow: React.FC<IProps> = observer(({ market }) => {
  const { tradeStore } = useStores();
  const navigate = useNavigate();

  const isFavorite = tradeStore.favMarkets.includes(market.symbol);

  const handleFavoriteClick = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const action = isFavorite ? tradeStore.removeFromFav : tradeStore.addToFav;

    action(market.symbol);
  };

  return (
    <Root
      onClick={() => {
        tradeStore.setMarketSelectionOpened(false);
        tradeStore.setIsPerp(false);
        navigate(`/${market.symbol}`);
      }}
    >
      <SmartFlex gap="4px" width="100%" column>
        <Icon alt="Add to Favorite" src={isFavorite ? filledStarIcon : outlineStarIcon} onClick={handleFavoriteClick} />
        <SmartFlex>
          <SmartFlex>
            <Icon alt="logo" src={market.baseToken?.logo} />
            <StyleIcon alt="logo" src={market.quoteToken?.logo} />
          </SmartFlex>
          <Text color="primary" type={TEXT_TYPES.H}>
            {market.symbol}
          </Text>
        </SmartFlex>
      </SmartFlex>
      <SmartFlex alignSelf="flex-end" justifyContent="flex-end" width="100%">
        <Text color="primary" type={TEXT_TYPES.H} nowrap>
          $ {market.priceUnits.toFormat(2)}
        </Text>
      </SmartFlex>
    </Root>
  );
});

export default PerpMarketRow;

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

const StyleIcon = styled(Icon)`
  position: relative;
  left: -6px;
`;
