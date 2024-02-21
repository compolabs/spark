import React, { HTMLAttributes, useCallback, useEffect } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import sellAndBuyIcon from "@src/assets/icons/buyAndSellOrderBookIcon.svg";
import buyIcon from "@src/assets/icons/buyOrderBookIcon.svg";
import sellIcon from "@src/assets/icons/sellOrderBookIcon.svg";
import { Row } from "@src/components/Flex";
import { SpotOrderSettingsSheet } from "@src/components/Modal";
import Select from "@src/components/Select";
import { SmartFlex } from "@src/components/SmartFlex";
import Text, { TEXT_TYPES } from "@src/components/Text";
import { SpotMarketOrder } from "@src/entity";
import { useEventListener } from "@src/hooks/useEventListener";
import useFlag from "@src/hooks/useFlag";
import { useMedia } from "@src/hooks/useMedia";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";
import hexToRgba from "@src/utils/hexToRgb";

import { ORDER_MODE, ORDER_TYPE, useCreateOrderSpotVM } from "../../LeftBlock/CreateOrderSpot/CreateOrderSpotVM";

import { useSpotOrderbookVM } from "./SpotOrderbookVM";

//todo отрефакторить и возможно перенесть часть логики в вью модель
//todo добавить лоадер
interface IProps extends HTMLAttributes<HTMLDivElement> {}

export const SPOT_DECIMAL_OPTIONS = [2, 4, 5, 6];
export const SPOT_SETTINGS_ICONS = [sellAndBuyIcon, sellIcon, buyIcon];

const SpotOrderBookImpl: React.FC<IProps> = observer(() => {
  const vm = useSpotOrderbookVM();
  const orderSpotVm = useCreateOrderSpotVM();
  const media = useMedia();
  const theme = useTheme();

  const [isSettingsOpen, openSettings, closeSettings] = useFlag();

  useEffect(() => {
    vm.calcSize(media.mobile);
  }, [media.mobile]);

  const handleCalcSize = useCallback(() => {
    vm.calcSize(media.mobile);
  }, [media.mobile]);

  useEventListener("resize", handleCalcSize);

  if (vm.orderbook.buy.length === 0 && vm.orderbook.sell.length === 0) {
    return (
      <Root center column>
        <Text type={TEXT_TYPES.SUPPORTING}>No orders yet</Text>
      </Root>
    );
  }

  const renderSettingsIcons = () => {
    if (media.mobile) {
      return <SettingIcon alt="filter" src={sellAndBuyIcon} onClick={openSettings} />;
    }

    return SPOT_SETTINGS_ICONS.map((image, index) => (
      <SettingIcon
        key={index}
        alt="filter"
        selected={vm.orderFilter === index}
        src={image}
        onClick={() => vm.setOrderFilter(index)}
      />
    ));
  };

  const renderSpread = () => {
    if (media.mobile) {
      return (
        <SpreadContainer>
          <Text type={TEXT_TYPES.H} primary>
            {vm.orderbook.spreadPrice.length ? vm.orderbook.spreadPrice : "0.00"}
          </Text>
          <Text>{`(${vm.orderbook.spreadPercent}%)`}</Text>
        </SpreadContainer>
      );
    }

    return (
      <SpreadContainer>
        <Text type={TEXT_TYPES.SUPPORTING}>SPREAD</Text>
        <Text primary>{vm.orderbook.spreadPrice}</Text>
        <Text>{`(${vm.orderbook.spreadPercent}%) `}</Text>
      </SpreadContainer>
    );
  };

  const renderOrders = (orders: SpotMarketOrder[], type: "sell" | "buy") => {
    const orderMode = type === "sell" ? ORDER_MODE.BUY : ORDER_MODE.SELL;
    const volumePercent = (ord: SpotMarketOrder) =>
      type === "sell" ? ord.baseSize.div(vm.totalSell) : ord.quoteSize.div(vm.totalBuy);
    const color = type === "sell" ? theme.colors.redLight : theme.colors.greenLight;

    return orders.map((o, index) => (
      <OrderRow
        key={index + "order"}
        type={type}
        onClick={() => {
          orderSpotVm.setOrderMode(orderMode);
          orderSpotVm.setInputPrice(o.price);
          orderSpotVm.setInputAmount(new BN(o.baseSize), true);
          orderSpotVm.setOrderType(ORDER_TYPE.Limit);
        }}
      >
        <VolumeBar type={type} volumePercent={volumePercent(o).times(100).toNumber()} />
        <Text primary>{o.baseSizeUnits.toSignificant(SPOT_DECIMAL_OPTIONS[+vm.decimalKey])}</Text>
        <Text primary>{o.quoteSizeUnits.toSignificant(SPOT_DECIMAL_OPTIONS[+vm.decimalKey])}</Text>
        <Text color={color}>{BN.formatUnits(o.price, 9).toSignificant(SPOT_DECIMAL_OPTIONS[+vm.decimalKey])}</Text>
      </OrderRow>
    ));
  };

  return (
    <Root>
      <SettingsContainer>
        <Select
          options={SPOT_DECIMAL_OPTIONS.map((v, index) => ({
            title: new BN(10).pow(-v).toString(),
            key: index.toString(),
          }))}
          selected={vm.decimalKey}
          onSelect={({ key }) => vm.setDecimalKey(key)}
        />
        {renderSettingsIcons()}
      </SettingsContainer>
      <OrderBookHeader>
        {/*todo добавить описание  в каком токене столбец (например Amount BTC | Total USDC | Price USDC)*/}
        <Text type={TEXT_TYPES.SUPPORTING}>Amount </Text>
        <Text type={TEXT_TYPES.SUPPORTING}>Total </Text>
        <Text type={TEXT_TYPES.SUPPORTING}>Price </Text>
      </OrderBookHeader>
      <Container fitContent={vm.orderFilter === 1 || vm.orderFilter === 2} reverse={vm.orderFilter === 1}>
        {vm.orderFilter === 0 && (
          <Plug length={vm.sellOrders.length < +vm.oneSizeOrders ? +vm.oneSizeOrders - 1 - vm.sellOrders.length : 0} />
        )}
        {vm.orderFilter === 1 && (
          <Plug
            length={vm.sellOrders.length < +vm.amountOfOrders ? +vm.amountOfOrders - 1 - vm.sellOrders.length : 0}
          />
        )}

        {vm.orderFilter !== 2 && renderOrders(vm.sellOrders, "sell")}

        {vm.orderFilter === 0 && renderSpread()}

        {vm.orderFilter !== 1 && renderOrders(vm.buyOrders, "buy")}

        {vm.orderFilter === 2 && (
          <Plug length={vm.buyOrders.length < +vm.amountOfOrders ? +vm.amountOfOrders - 1 - vm.buyOrders.length : 0} />
        )}
        {vm.orderFilter === 0 && (
          <Plug length={vm.buyOrders.length < +vm.oneSizeOrders ? +vm.oneSizeOrders - 1 - vm.buyOrders.length : 0} />
        )}
      </Container>

      <SpotOrderSettingsSheet
        decimals={SPOT_DECIMAL_OPTIONS}
        filterIcons={SPOT_SETTINGS_ICONS}
        isOpen={isSettingsOpen}
        selectedDecimal={vm.decimalKey}
        selectedFilter={vm.orderFilter}
        onClose={closeSettings}
        onDecimalSelect={vm.setDecimalKey}
        onFilterSelect={vm.setOrderFilter}
      />
    </Root>
  );
});

export default SpotOrderBookImpl;

const Plug: React.FC<{
  length: number;
}> = ({ length }) => (
  <>
    {Array.from({ length }).map((_, index) => (
      <PlugContainer key={index + "positive-plug"}>
        <Text>-</Text>
        <Text>-</Text>
        <Text>-</Text>
      </PlugContainer>
    ))}
  </>
);

const PlugContainer = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 1px;
  height: 16px;
  width: 100%;
  padding: 0 12px;
  text-align: center;

  ${Text} {
    text-align: start;
  }

  ${Text}:last-of-type {
    text-align: end;
  }

  ${media.mobile} {
    grid-template-columns: repeat(2, 1fr);

    ${Text}:nth-of-type(2) {
      display: none;
    }
  }
`;

const Root = styled(SmartFlex)`
  grid-area: orderbook;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 8px;

  ${media.mobile} {
    padding: 8px 0;
  }
`;

const SettingsContainer = styled(Row)`
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 12px;
  gap: 8px;

  ${media.mobile} {
    order: 3;
  }
`;

const SettingIcon = styled.img<{ selected?: boolean }>`
  cursor: pointer;
  transition: 0.4s;
  border-radius: 4px;
  border: 1px solid ${({ selected, theme }) => (selected ? theme.colors.borderAccent : "transparent")};

  &:hover {
    border: 1px solid ${({ selected, theme }) => (selected ? theme.colors.borderAccent : theme.colors.borderPrimary)};
  }
`;

const OrderBookHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  padding: 0 12px;
  text-align: center;

  ${Text} {
    text-align: start;
  }

  ${Text}:last-of-type {
    text-align: end;
  }

  ${media.mobile} {
    grid-template-columns: repeat(2, 1fr);

    ${Text}:nth-of-type(2) {
      display: none;
    }
  }
`;
const OrderRow = styled(Row)<{ type: "buy" | "sell" }>`
  position: relative;
  cursor: pointer;
  margin-bottom: 1px;
  height: 16px;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  background: transparent;
  transition: 0.4s;

  &:hover {
    background: ${({ type, theme }) =>
      type === "buy" ? hexToRgba(theme.colors.greenLight, 0.1) : hexToRgba(theme.colors.redLight, 0.1)};
  }

  ${media.mobile} {
    & > ${Text}:nth-of-type(2) {
      display: none;
    }
  }

  & > div:last-of-type {
    text-align: right;
  }

  & > div {
    flex: 1;
    text-align: left;
    z-index: 1;
  }
`;

const Container = styled.div<{
  fitContent?: boolean;
  reverse?: boolean;
}>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  ${({ fitContent }) => !fitContent && "height: 100%;"};
  ${({ reverse }) => reverse && "flex-direction: column-reverse;"};
  height: 100%;
`;

const SpreadContainer = styled(SmartFlex)`
  padding-left: 12px;
  height: 24px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  align-items: center;
  gap: 12px;
`;

const ProgressBar = styled.span<{ type: "buy" | "sell"; fulfillPercent?: number }>`
  z-index: 0;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: ${({ type, theme }) =>
    type === "buy" ? hexToRgba(theme.colors.greenLight, 0.1) : hexToRgba(theme.colors.redLight, 0.1)};
  transition: all 0.3s;
  width: ${({ fulfillPercent }) => (fulfillPercent ? `${fulfillPercent}%` : `0%`)};
`;

const VolumeBar = styled(ProgressBar)<{ volumePercent?: number }>`
  width: ${({ volumePercent }) => (volumePercent ? `${volumePercent}%` : `0%`)};
`;
