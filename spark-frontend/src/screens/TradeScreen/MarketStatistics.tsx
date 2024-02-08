import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column, DesktopRow, Row } from "@src/components/Flex";
import SizedBox from "@src/components/SizedBox";
import { SmartFlex } from "@src/components/SmartFlex";
import Text, { TEXT_TYPES } from "@src/components/Text";
import { useMedia } from "@src/hooks/useMedia";
import { useStores } from "@src/stores";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";

const MarketStatistics: React.FC = observer(() => {
  const { tradeStore } = useStores();
  const theme = useTheme();
  const media = useMedia();

  //todo исправить значения
  const spotStatsArr = [
    { title: "Index price", value: tradeStore.market?.priceUnits.toFormat(2) },
    { title: "24h volume", value: "$ 0.00" },
    { title: "24h High", value: "$ 0.00" },
    { title: "24h Low", value: "$ 0.00" },
  ];

  const renderMobile = () => {
    const indexPrice = tradeStore.market?.priceUnits ?? BN.ZERO;

    return (
      <MobileRoot>
        <SmartFlex column>
          <SmartFlex gap="4px" column>
            <Text type={TEXT_TYPES.H} primary>
              {indexPrice.toFormat(2)}
            </Text>
            <SmartFlex center="y" gap="8px">
              <Text primary>0.00</Text>
              <Text>0.02%</Text>
            </SmartFlex>
          </SmartFlex>
        </SmartFlex>
        <SmartFlex gap="8px" column>
          <SmartFlex gap="2px" column>
            <Text>Pred. funding rate</Text>
            <Text primary>0.00</Text>
          </SmartFlex>
          <SmartFlex gap="2px" column>
            <Text>Open interest</Text>
            <Text primary>0.00</Text>
          </SmartFlex>
        </SmartFlex>
        <SmartFlex gap="8px" column>
          <SmartFlex gap="2px" column>
            <Text>24H AVG. funding</Text>
            <Text primary>0.00</Text>
          </SmartFlex>
          <SmartFlex gap="2px" column>
            <Text>24H volume</Text>
            <Text primary>0.00</Text>
          </SmartFlex>
        </SmartFlex>
      </MobileRoot>
    );
  };

  const renderDesktop = () => {
    return (
      <Root>
        <PriceRow alignItems="center">
          <Column alignItems="flex-end">
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
      </Root>
    );
  };

  return media.mobile ? renderMobile() : renderDesktop();
});

export default MarketStatistics;

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  width: 100%;
`;

const MobileRoot = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px;
`;

const PriceRow = styled(Row)`
  align-items: center;
  justify-content: flex-end;

  ${media.desktop} {
    justify-content: flex-start;
  }
`;
