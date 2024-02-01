import React, { useRef } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import arrow from "@src/assets/icons/arrowUp.svg";
import { ReactComponent as SwitchIcon } from "@src/assets/icons/switch.svg";
import { Column, DesktopRow, Row } from "@src/components/Flex";
import { SmartFlex } from "@src/components/SmartFlex";
import { useOnClickOutside } from "@src/hooks/useOnClickOutside";
import { media } from "@src/themes/breakpoints";
import { useStores } from "@stores";

interface IProps {}

const MarketStatisticsBar: React.FC<IProps> = observer(() => {
  const { tradeStore } = useStores();
  const theme = useTheme();

  const rootRef = useRef(null);

  //todo исправить значения
  const spotStatsArr = [
    { title: "Index price", value: tradeStore.market?.priceUnits.toFormat(2) },
    { title: "24h volume", value: "$ 0.00" },
    { title: "24h High", value: "$ 0.00" },
    { title: "24h Low", value: "$ 0.00" },
  ];

  useOnClickOutside(rootRef, () => tradeStore.setMarketSelectionOpened(false));

  const renderMarketSelector = () => {
    if (!tradeStore.market) return;

    return (
      <MarketSelect
        className="marketSelect"
        focused={tradeStore.marketSelectionOpened}
        style={tradeStore.marketSelectionOpened ? { background: "#1B1B1B", borderRadius: "10px 0 0 10px" } : {}}
        onClick={() => tradeStore.setMarketSelectionOpened(!tradeStore.marketSelectionOpened)}
      >
        {/*todo добавить скелетон лоадер*/}
        <SmartFlex gap="8px" center>
          <Icon alt="token0" src={tradeStore.market?.baseToken.logo} style={{ width: 24, height: 24 }} />
          <Icon
            alt="token1"
            src={tradeStore.market?.quoteToken.logo}
            style={{ width: 24, height: 24, marginLeft: -16 }}
          />
          <SmartFlex gap="4px" center>
            <StyledText type={TEXT_TYPES.H} primary>
              {tradeStore.market?.symbol}
            </StyledText>
            <img alt="arrow" className="menu-arrow" src={arrow} style={{ width: 24, height: 24 }} />
          </SmartFlex>
        </SmartFlex>
      </MarketSelect>
    );
  };

  return (
    <Root ref={rootRef}>
      {renderMarketSelector()}
      <MarketStatistics>
        <PriceRow alignItems="center">
          <Column alignItems="flex-end">
            {/*todo добавить изменение цены*/}
            {/*<Text*/}
            {/*	type={TEXT_TYPES.BODY}*/}
            {/*	style={{ color: state.priceChange?.gt(0) ? theme.colors.greenLight : theme.colors.redLight }}*/}
            {/*>*/}
            {/*	{tradeStore.isMarketPerp ? perpStats?.priceChange?.toFormat(2) : spotStats?.priceChange?.toFormat(2)}*/}
            {/*</Text>*/}
            <Text type={TEXT_TYPES.H} primary>
              $ {tradeStore.market?.priceUnits.toFormat(2)}
            </Text>
          </Column>
          <DesktopRow>
            {spotStatsArr.map(({ title, value }) => (
              <React.Fragment key={title}>
                <SizedBox height={30} style={{ background: theme.colors.bgPrimary, margin: "0 8px" }} width={1} />
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
      <SwitchContainer>
        <SwitchIcon />
      </SwitchContainer>
    </Root>
  );
});

export default MarketStatisticsBar;

const Root = styled.div`
  display: grid;
  grid-template-columns: minmax(min-content, 280px) minmax(300px, 1fr) minmax(100px, 280px);
  grid-template-rows: 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;

  height: 50px;
  width: 100%;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 10px;

  ${media.mobile} {
    grid-template-columns: 1fr 1fr;
    height: 40px;
  }
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
  max-width: 280px;
  height: 100%;
  gap: 4px;

  .menu-arrow {
    cursor: pointer;
    transition: 0.4s;
    transform: ${({ focused }) => (focused ? "rotate(-180deg)" : "rotate(0deg)")};
  }

  :hover {
    .menu-arrow {
      transform: ${({ focused, disabled }) =>
        focused ? "rotate(-180)" : disabled ? "rotate(0deg)" : "rotate(-90deg)"};
    }
  }
`;

const MarketStatistics = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  width: 100%;

  ${media.mobile} {
    display: none;
  }
`;

const StyledText = styled(Text)`
  width: max-content;
`;

const PriceRow = styled(Row)`
  align-items: center;
  justify-content: flex-end;

  ${media.desktop} {
    justify-content: flex-start;
  }
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
