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
import {
  BottomTablesInterfaceSpotVMProvider,
  useBottomTablesInterfaceSpotVM,
} from "@screens/TradeScreen/BottomTables/BottomTablesInterfaceSpot/BottomTablesInterfaceSpotVM";
import tableLargeSize from "@src/assets/icons/tableLargeSize.svg";
import tableMediumSize from "@src/assets/icons/tableMediumSize.svg";
import tableSizeExtraSmall from "@src/assets/icons/tableSizeExtraSmall.svg";
import tableSmallSize from "@src/assets/icons/tableSmallSize.svg";
import tableSizeSelector from "@src/assets/icons/tablesSize.svg";
import { Column, Row } from "@src/components/Flex";
import Table from "@src/components/Table";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { TRADE_TABLE_SIZE } from "@src/stores/SettingsStore";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface IProps {}

const MAX_TABLE_HEIGHT = {
  [TRADE_TABLE_SIZE.XS]: "120px",
  [TRADE_TABLE_SIZE.S]: "197px",
  [TRADE_TABLE_SIZE.M]: "263px",
  [TRADE_TABLE_SIZE.L]: "395px",
};

const Root = styled.div<{ size: TRADE_TABLE_SIZE }>`
  background: ${({ theme }) => theme.colors.bgSecondary};
  display: flex;
  width: 100%;
  flex-direction: column;
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.colors.bgSecondary};
  flex: 1;
  border-radius: 10px;
  max-width: 100%;
  overflow-x: scroll;
  max-height: ${({ size }) => MAX_TABLE_HEIGHT[size]};
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
  box-sizing: border-box;

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
  box-sizing: border-box;
  padding: 0 12px;
  height: 32px;
  position: relative;

  & > * {
    margin: 0 12px;
  }
`;
const TableSizeSelector = styled.div`
  position: absolute;
  right: 0;
  top: 4px;
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
  box-sizing: border-box;
  width: 100%;
  cursor: pointer;

  ${({ active, theme }) => active && `background: ${theme.colors.borderPrimary}`};

  :hover {
    background: ${({ theme }) => theme.colors.borderSecondary};
  }
`;

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
  { Header: "Amount", accessor: "amount" },
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

  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState<any>([]);

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
      action: null,
    }));

  const getBalanceData = () =>
    Object.entries(balanceStore.balances)
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

  useEffect(() => {
    setData(tabIndex === 0 ? getOrderData() : getBalanceData());
  }, [tabIndex, vm.myOrders, balanceStore.balances]);

  return (
    <Root size={settingsStore.tradeTableSize}>
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
          {/*todo кнопка изменения высоты нижнего блока работает не правильно и при маленькой высоте тултип не влезает */}
          <Tooltip
            config={RESIZE_TOOLTIP_CONFIG}
            content={
              <div>
                {TABLE_SIZES_CONFIG.map(({ size, icon, title }) => (
                  <TableSize
                    key={title}
                    active={settingsStore.tradeTableSize === size}
                    onClick={() => settingsStore.setTradeTableSize(size)}
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
            <img alt="tableSizeSelector" src={tableSizeSelector} style={{ cursor: "pointer" }} />
          </Tooltip>
        </TableSizeSelector>
      </TabContainer>
      <Column crossAxisSize="max" style={{ overflowY: "scroll" }}>
        <Table
          columns={COLUMNS[tabIndex]}
          data={data}
          style={{
            whiteSpace: "nowrap",
            width: "fitContent",
            minWidth: "fit-content",
          }}
        />
      </Column>
    </Root>
  );
});

const BottomTablesInterfaceSpot = () => (
  <BottomTablesInterfaceSpotVMProvider>
    <BottomTablesInterfaceSpotImpl />
  </BottomTablesInterfaceSpotVMProvider>
);

export default BottomTablesInterfaceSpot;
