import React, { useEffect, useState } from "react";
import { Config } from "react-popper-tooltip";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Chip from "@components/Chip";
import SizedBox from "@components/SizedBox";
import Tab from "@components/Tab";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import Tooltip from "@components/Tooltip";
import { useBottomTablesInterfaceSpotVM } from "@screens/TradeScreen/BottomTables/BottomTablesInterfaceSpot/BottomTablesInterfaceSpotVM";
import tableLargeSize from "@src/assets/icons/tableLargeSize.svg";
import tableMediumSize from "@src/assets/icons/tableMediumSize.svg";
import tableSizeExtraSmall from "@src/assets/icons/tableSizeExtraSmall.svg";
import tableSmallSize from "@src/assets/icons/tableSmallSize.svg";
import tableSizeSelector from "@src/assets/icons/tablesSize.svg";
import Button from "@src/components/Button";
import { Row } from "@src/components/Flex";
import { SmartFlex } from "@src/components/SmartFlex";
import Table from "@src/components/Table";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { useMedia } from "@src/hooks/useMedia";
import { TRADE_TABLE_SIZE } from "@src/stores/SettingsStore";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface IProps {}

const MAX_TABLE_HEIGHT = {
  [TRADE_TABLE_SIZE.XS]: "120px",
  [TRADE_TABLE_SIZE.S]: "197px",
  [TRADE_TABLE_SIZE.M]: "263px",
  [TRADE_TABLE_SIZE.L]: "395px",
};

const TABS = [
  { title: "ORDERS", disabled: false },
  { title: "BALANCES", disabled: false },
];

const TABLE_SIZES_CONFIG = [
  { title: "Extra small", icon: tableSizeExtraSmall, size: TRADE_TABLE_SIZE.XS },
  { title: "Small", icon: tableSmallSize, size: TRADE_TABLE_SIZE.S },
  { title: "Medium", icon: tableMediumSize, size: TRADE_TABLE_SIZE.M },
  { title: "Large", icon: tableLargeSize, size: TRADE_TABLE_SIZE.L },
];

const ORDER_COLUMNS = [
  { Header: "Date", accessor: "date" },
  { Header: "Pair", accessor: "pair" },
  { Header: "Type", accessor: "type" },
  {
    Header: "Amount",
    accessor: "amount",
    tooltip: (
      <>
        <Text type={TEXT_TYPES.BODY}>
          Amount represents the quantity of cryptocurrency tokens bought or sold in a transaction on the exchange.
        </Text>
        <Text type={TEXT_TYPES.BODY}>For buys, it shows tokens acquired; for sells, tokens sold.</Text>
      </>
    ),
  },
  { Header: "Price", accessor: "price" },
  { Header: "", accessor: "action" },
];

const BALANCE_COLUMNS = [
  { Header: "Asset", accessor: "asset" },
  { Header: "Balance", accessor: "balance" },
];

const COLUMNS = [ORDER_COLUMNS, BALANCE_COLUMNS];

const RESIZE_TOOLTIP_CONFIG: Config = { placement: "bottom-start", trigger: "click" };

const BottomTablesInterfaceSpotImpl: React.FC<IProps> = observer(() => {
  const { settingsStore, balanceStore } = useStores();
  const vm = useBottomTablesInterfaceSpotVM();
  const theme = useTheme();
  const media = useMedia();

  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const tooltipConfig: Config = {
    ...RESIZE_TOOLTIP_CONFIG,
    visible: isTooltipVisible,
    onVisibleChange: setIsTooltipVisible,
  };

  const getOrderData = () =>
    vm.myOrders.map((order) => ({
      date: order.timestamp.format("DD MMM YY, HH:mm"),
      pair: order.marketSymbol,
      type: (
        <TableText color={order.type === "SELL" ? theme.colors.redLight : theme.colors.greenLight}>
          {order.type}
        </TableText>
      ),
      amount: <TableText primary>{order.baseSizeUnits.toFormat(2)}</TableText>,
      price: order.priceUnits.toFormat(2),
      action: (
        <CancelButton onClick={() => vm.cancelOrder(order.id)}>
          {vm.isOrderCancelling ? "Loading..." : "Close"}
        </CancelButton>
      ),
    }));

  const getBalanceData = () =>
    Array.from(balanceStore.balances)
      .filter(([, balance]) => balance && balance.gt(0))
      .map(([assetId, balance]) => {
        const token = TOKENS_BY_ASSET_ID[assetId];
        return {
          asset: (
            <Row alignItems="center">
              <TokenIcon alt="market-icon" src={token.logo} />
              <SizedBox width={4} />
              {token.symbol}
            </Row>
          ),
          balance: BN.formatUnits(balance, token.decimals).toFormat(2),
        };
      });

  const renderMobileRows = () => {
    const data = getOrderData().map((ord, i) => (
      <MobileTableRow key={i + "mobile-row"}>
        <MobileTableRowColumn>
          <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
            {ord.pair}
          </Text>
          <SmartFlex gap="2px" column>
            <Text type={TEXT_TYPES.SUPPORTING}>Amount</Text>
            <SmartFlex center="y" gap="4px">
              <Text color={theme.colors.textPrimary}>20,980.00</Text>
              <TokenBadge>
                <Text>ETH</Text>
              </TokenBadge>
            </SmartFlex>
          </SmartFlex>
        </MobileTableRowColumn>
        <MobileTableRowColumn>
          <Text color={theme.colors.textPrimary}>Active</Text>
          <SmartFlex gap="2px" column>
            <SmartFlex center="y" gap="4px">
              <Text type={TEXT_TYPES.SUPPORTING}>Side:</Text>
              <Text color={theme.colors.redLight}>Sell</Text>
            </SmartFlex>
            <SmartFlex center="y">
              <Text type={TEXT_TYPES.SUPPORTING}>Filled:</Text>
              <Text color={theme.colors.textPrimary}>1%</Text>
            </SmartFlex>
          </SmartFlex>
        </MobileTableRowColumn>
        <MobileTableRowColumn>
          <CancelButton>Cancel</CancelButton>
          <SmartFlex alignItems="flex-end" gap="2px" column>
            <Text type={TEXT_TYPES.SUPPORTING}>Price:</Text>
            <Text color={theme.colors.textPrimary}>$9,999,000.00</Text>
          </SmartFlex>
        </MobileTableRowColumn>
      </MobileTableRow>
    ));

    return (
      <SmartFlex width="100%" column>
        {data}
      </SmartFlex>
    );
  };

  const handleTableSize = (size: TRADE_TABLE_SIZE) => {
    settingsStore.setTradeTableSize(size);
    setIsTooltipVisible(false);
  };

  const renderTable = () => {
    if (!data.length) {
      return (
        <SmartFlex height="100%" padding={media.mobile ? "16px" : "32px"} width="100%" center>
          <Text type={TEXT_TYPES.BUTTON_SECONDARY} secondary>
            No Data
          </Text>
        </SmartFlex>
      );
    }

    if (media.mobile) {
      return renderMobileRows();
    }

    return (
      <Table
        columns={COLUMNS[tabIndex]}
        data={data}
        style={{
          whiteSpace: "nowrap",
          width: "fitContent",
          minWidth: "fit-content",
        }}
      />
    );
  };

  useEffect(() => {
    setData(tabIndex === 0 ? getOrderData() : getBalanceData());
  }, [tabIndex, vm.myOrders, balanceStore.balances]);

  return (
    <Root gap="16px" size={settingsStore.tradeTableSize} column>
      <TableRoot>
        <TabContainer>
          {TABS.map(({ title, disabled }, index) => (
            <Tab
              key={title + index}
              active={tabIndex === index}
              disabled={disabled}
              onClick={() => !disabled && setTabIndex(index)}
            >
              {title}
            </Tab>
          ))}
          <TableSizeSelector>
            <Tooltip
              config={tooltipConfig}
              content={
                <div>
                  {TABLE_SIZES_CONFIG.map(({ size, icon, title }) => (
                    <TableSize
                      key={title}
                      active={settingsStore.tradeTableSize === size}
                      onClick={() => handleTableSize(size)}
                    >
                      <img alt={title} src={icon} />
                      <SizedBox width={4} />
                      <Text type={TEXT_TYPES.BUTTON} nowrap>
                        {title.toUpperCase()}
                      </Text>
                    </TableSize>
                  ))}
                </div>
              }
            >
              <img
                alt="tableSizeSelector"
                src={tableSizeSelector}
                style={{ cursor: "pointer" }}
                onClick={() => setIsTooltipVisible(true)}
              />
            </Tooltip>
          </TableSizeSelector>
        </TabContainer>
        <TableContainer>{renderTable()}</TableContainer>
      </TableRoot>
      {!!vm.myOrders.length && <CancelAllButton>Cancel all orders</CancelAllButton>}
    </Root>
  );
});

export default BottomTablesInterfaceSpotImpl;

const TableRoot = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  display: flex;
  width: 100%;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.bgSecondary};
  flex: 1;
  border-radius: 10px;
  max-width: 100%;
  overflow-x: scroll;

  ${media.mobile} {
    flex: initial;
  }
`;

const Root = styled(SmartFlex)<{ size: TRADE_TABLE_SIZE }>`
  width: 100%;
  height: ${({ size }) => MAX_TABLE_HEIGHT[size]};
  transition: height 200ms;

  ${media.mobile} {
    height: fit-content;
  }
`;

//todo добавтьб тултипы с информацией в заголовке колонок (напримеп margin: margin is how much of collateral position is taking (degen))
export const TableTitle = styled(Text)`
  flex: 1;
  white-space: nowrap;
  ${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]}
`;

export const TableText = styled(Text)`
  flex: 1;
  display: flex;
  align-items: center;
`;

export const TableRow = styled(Row)`
  margin-bottom: 1px;
  height: 32px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.bgPrimary};
  align-items: center;
  padding: 0 12px;

  :last-of-type {
    margin-bottom: 0;
  }
`;

const CancelButton = styled(Chip)`
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;

const TabContainer = styled(Row)`
  align-items: center;
  padding: 0 12px;
  height: 32px;
  position: relative;

  ${Tab} {
    margin: 0 12px;
  }
`;

const TableSizeSelector = styled.div`
  position: absolute;
  right: 12px;
  top: 4px;

  ${media.mobile} {
    display: none;
  }
`;

const TokenIcon = styled.img`
  width: 12px;
  height: 12px;
  border-radius: 50%;
`;

const TableSize = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 4px 12px;
  width: 100%;
  cursor: pointer;

  ${({ active, theme }) => active && `background: ${theme.colors.borderPrimary}`};

  :hover {
    background: ${({ theme }) => theme.colors.borderSecondary};
  }
`;

const TableContainer = styled(SmartFlex)`
  width: 100%;
  overflow-y: scroll;
`;

const MobileTableRow = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  padding: 11px 7px 14px 7px;
  background: ${({ theme }) => theme.colors.bgPrimary};

  position: relative;

  &:not(:last-of-type)::after {
    content: "";

    position: absolute;
    bottom: 0;
    width: 100%;

    height: 1px;
    box-shadow: inset 0 1px 0 0 ${({ theme }) => theme.colors.bgSecondary};
  }
`;

const MobileTableRowColumn = styled(SmartFlex)`
  flex-direction: column;
  gap: 7px;

  &:last-of-type {
    align-items: flex-end;
  }
`;

const TokenBadge = styled(SmartFlex)`
  padding: 4px 8px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-radius: 4px;

  ${Text} {
    line-height: 10px;
  }
`;

const CancelAllButton = styled(Button)`
  text-transform: uppercase;

  ${media.desktop} {
    display: none;
  }
`;
