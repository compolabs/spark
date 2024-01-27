import React, { useState } from "react";
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
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div<{ size: string }>`
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

  & > * {
    min-width: 580px;
  }

  ${({ size }) =>
    (() => {
      switch (size) {
        case "extraSmall":
          return `max-height: 120px;`;
        case "small":
          return `max-height: 197px;`;
        case "medium":
          return `max-height: 263px;`;
        case "large":
          return `max-height: 395px;`;
        default:
          return `max-height: 197px;`;
      }
    })()}
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
  { title: "Extra small", icon: tableSizeExtraSmall, size: "extraSmall" },
  { title: "Small", icon: tableSmallSize, size: "small" },
  { title: "Medium", icon: tableMediumSize, size: "medium" },
  { title: "Large", icon: tableLargeSize, size: "large" },
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

const BottomTablesInterfaceSpotImpl: React.FC<IProps> = observer(() => {
  const { settingsStore, accountStore } = useStores();
  const vm = useBottomTablesInterfaceSpotVM();
  const theme = useTheme();

  const [tableSize, setTableSize] = useState(settingsStore.tradeTableSize ?? "small");
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

  //fixme после того как балансы переехали в balanceStore этот код не работает
  // const getBalanceData = () =>
  //   Object.entries(accountStore.tokenBalances)
  //     .filter(([, balance]) => balance && balance.gt(0))
  //     .map(([assetId, balance]) => {
  //       const token = TOKENS_BY_ASSET_ID[assetId];
  //       return {
  //         asset: (
  //           <Row alignItems="center">
  //             <TokenIcon alt="market-icon" src={token.logo} />
  //             <SizedBox width={4} />
  //             {token.symbol}
  //           </Row>
  //         ),
  //         balance: BN.formatUnits(balance, token.decimals).toFormat(2),
  //       };
  //     });
  //
  // React.useEffect(() => {
  //   setData(tabIndex === 0 ? getOrderData() : getBalanceData());
  // }, [tabIndex, vm.myOrders, accountStore.tokenBalances]);

  return (
    <Root size={tableSize}>
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
            config={{ placement: "bottom-start", trigger: "click" }}
            content={
              <Column crossAxisSize="max" style={{ zIndex: 500 }}>
                {TABLE_SIZES_CONFIG.map(({ size, icon, title }) => (
                  <TableSize
                    key={title}
                    active={size === tableSize}
                    onClick={() => {
                      settingsStore.setTradeTableSize(size);
                      setTableSize(size);
                    }}
                  >
                    <img alt={title} src={icon} />
                    <SizedBox width={4} />
                    <Text type={TEXT_TYPES.BUTTON} nowrap>
                      {title.toUpperCase()}
                    </Text>
                  </TableSize>
                ))}
              </Column>
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
