import React, { useRef } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import arrow from "@src/assets/icons/arrowUp.svg";
import { Column, DesktopRow, Row } from "@src/components/Flex";
import { useOnClickOutside } from "@src/hooks/useOnClickOutside";
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

  return (
    <Root ref={rootRef}>
      <MarketSelect
        className="marketSelect"
        focused={tradeStore.marketSelectionOpened}
        style={tradeStore.marketSelectionOpened ? { background: "#1B1B1B", borderRadius: "10px 0 0 10px" } : {}}
        onClick={() => tradeStore.setMarketSelectionOpened(!tradeStore.marketSelectionOpened)}
      >
        <Row alignItems="center">
          {/*todo добавить скелетон лоадер*/}
          {tradeStore.market && (
            <>
              <Icon alt="token0" src={tradeStore.market?.baseToken.logo} style={{ width: 24, height: 24 }} />
              <Icon
                alt="token1"
                src={tradeStore.market?.quoteToken.logo}
                style={{ width: 24, height: 24, marginLeft: -8 }}
              />
              <SizedBox width={8} />
              <Text type={TEXT_TYPES.H} primary>
                {tradeStore.market?.symbol}
              </Text>
            </>
          )}
        </Row>
        <SizedBox width={10} />
        <img alt="arrow" className="menu-arrow" src={arrow} style={{ width: 24, height: 24, marginLeft: -8 }} />
      </MarketSelect>
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
      <div />
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
`;

const PriceRow = styled(Row)`
  align-items: center;
  justify-content: flex-end;
  @media (min-width: 880px) {
    justify-content: flex-start;
  }
`;
