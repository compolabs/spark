import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Text, { TEXT_TYPES } from "@components/Text";
import arrowLeft from "@src/assets/icons/arrowLeft.svg";
import arrowUp from "@src/assets/icons/arrowUp.svg";
import { ReactComponent as SwitchIcon } from "@src/assets/icons/switch.svg";
import { SmartFlex } from "@src/components/SmartFlex";
import { useMedia } from "@src/hooks/useMedia";
import { media } from "@src/themes/breakpoints";
import { useStores } from "@stores";

import MarketStatistics from "./MarketStatistics";

interface IProps {
  isChartOpen?: boolean;
  onSwitchClick?: () => void;
}

const MarketStatisticsBar: React.FC<IProps> = observer(({ isChartOpen, onSwitchClick }) => {
  const { tradeStore } = useStores();
  const media = useMedia();

  const handleBack = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSwitchClick?.();
  };

  const renderLeftIcons = () => {
    if (isChartOpen) {
      return <Icon alt="token0" src={arrowLeft} onClick={handleBack} />;
    }

    return (
      <>
        <Icon alt="token0" src={tradeStore.market?.baseToken.logo} />
        <Icon alt="token1" src={tradeStore.market?.quoteToken.logo} style={{ marginLeft: -16 }} />
      </>
    );
  };

  const renderMarketSelector = () => {
    if (!tradeStore.market) return;

    return (
      <MarketSelect
        focused={tradeStore.marketSelectionOpened}
        style={tradeStore.marketSelectionOpened ? { background: "#1B1B1B", borderRadius: "10px 0 0 10px" } : {}}
        onClick={() => tradeStore.setMarketSelectionOpened(!tradeStore.marketSelectionOpened)}
      >
        {/*todo добавить скелетон лоадер*/}
        <SmartFlex gap="8px" center>
          {renderLeftIcons()}
          <SmartFlex gap="4px" center>
            <StyledText type={TEXT_TYPES.H} primary>
              {tradeStore.market?.symbol}
            </StyledText>
            <StyledArrow alt="arrow" src={arrowUp} />
          </SmartFlex>
        </SmartFlex>
      </MarketSelect>
    );
  };

  return (
    <Root>
      {renderMarketSelector()}
      {media.desktop && <MarketStatistics />}
      {!isChartOpen && (
        <SwitchContainer onClick={onSwitchClick}>
          <SwitchIcon />
        </SwitchContainer>
      )}
    </Root>
  );
});

export default MarketStatisticsBar;

const Root = styled.div`
  display: grid;
  grid-template-columns: minmax(min-content, 280px) minmax(300px, 1fr) 0;
  grid-template-rows: 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;

  height: 50px;
  width: 100%;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;

  ${media.mobile} {
    grid-template-columns: 1fr 0;
    height: 40px;
  }
`;
const Icon = styled.img`
  border-radius: 50%;
  height: 24px;
  width: 24px;
`;

const StyledArrow = styled.img`
  width: 24;
  height: 24;
`;

const MarketSelect = styled.div<{
  focused?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  max-width: 280px;
  height: 100%;
  gap: 4px;
  cursor: pointer;

  ${StyledArrow} {
    cursor: pointer;
    transition: 0.4s;
    transform: ${({ focused }) => (focused ? "rotate(-180deg)" : "rotate(0deg)")};
  }

  :hover {
    ${StyledArrow} {
      transform: ${({ focused, disabled }) =>
        focused ? "rotate(-180)" : disabled ? "rotate(0deg)" : "rotate(-90deg)"};
    }
  }

  ${media.mobile} {
    max-width: unset;
  }
`;

const StyledText = styled(Text)`
  width: max-content;
`;

const SwitchContainer = styled(SmartFlex)`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  align-self: center;
  justify-self: flex-end;
  margin-right: 8px;

  border-radius: 100%;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};

  ${media.desktop} {
    display: none;
  }
`;
