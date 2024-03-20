import React, { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Text, { TEXT_TYPES } from "@components/Text";
import { ReactComponent as ArrowLeftIcon } from "@src/assets/icons/arrowLeft.svg";
import outlineStarIcon from "@src/assets/icons/star.svg";
import filledStarIcon from "@src/assets/icons/yellowStar.svg";
import { SmartFlex } from "@src/components/SmartFlex";
import { SpotMarket } from "@src/entity";
import { useStores } from "@stores";

interface IProps {
  market: SpotMarket;
}

const SpotMarketRow: React.FC<IProps> = observer(({ market }) => {
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
        tradeStore.setIsPerp(true);
        navigate(`/perp/${market.symbol}`);
      }}
    >
      <SmartFlex gap="4px" width="100%" column>
        <SmartFlex gap="4px">
          <Icon
            alt="Add to Favorite"
            src={isFavorite ? filledStarIcon : outlineStarIcon}
            onClick={handleFavoriteClick}
          />
          <LeverageText center>
            <Text type={TEXT_TYPES.SUPPORTING} secondary>
              10x
            </Text>
          </LeverageText>
        </SmartFlex>
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
      <SmartFlex height="100%" justifyContent="flex-end" width="100%" column>
        <PriceChangeContainer alignSelf="flex-end" center="y" gap="4px" isPositive>
          <PriceChangeIcon viewBox="0 0 24 24" />
          <Text type={TEXT_TYPES.BODY}>0.02%</Text>
        </PriceChangeContainer>
        <SmartFlex alignSelf="flex-end">
          <Text color="primary" type={TEXT_TYPES.H} nowrap>
            $ {market.priceUnits.toFormat(2)}
          </Text>
        </SmartFlex>
      </SmartFlex>
    </Root>
  );
});

export default SpotMarketRow;

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

const LeverageText = styled(SmartFlex)`
  border: 1px solid ${({ theme }) => theme.colors.iconSecondary};
  border-radius: 4px;
  height: 16px;
  width: 25px;
`;

const PriceChangeIcon = styled(ArrowLeftIcon)`
  transform: rotate(90deg);
  height: 12px;
  width: 12px;
`;

const PriceChangeContainer = styled(SmartFlex)<{ isPositive: boolean }>`
  ${Text} {
    color: ${({ theme, isPositive }) => (isPositive ? theme.colors.greenLight : theme.colors.redLight)};
  }

  ${PriceChangeIcon} {
    path {
      fill: ${({ theme, isPositive }) => (isPositive ? theme.colors.greenLight : theme.colors.redLight)};
    }
  }
`;
