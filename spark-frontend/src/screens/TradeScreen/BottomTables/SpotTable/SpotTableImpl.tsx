import React, { useState } from "react";
import { Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { createColumnHelper } from "@tanstack/react-table";
import { observer } from "mobx-react";

import Chip from "@components/Chip";
import Text, { TEXT_TYPES } from "@components/Text";
import { Row } from "@src/components/Flex";
import SizedBox from "@src/components/SizedBox";
import { SmartFlex } from "@src/components/SmartFlex";
import Table from "@src/components/Table";
import { SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import { useMedia } from "@src/hooks/useMedia";
import MintButtons from "@src/screens/Faucet/MintButtons";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";
import { toCurrency } from "@src/utils/toCurrency";
import { useStores } from "@stores";

import { BaseTable } from "../BaseTable";

import { useSpotTableVMProvider } from "./SpotTableVM";

const TABS = [
  { title: "ORDERS", disabled: false },
  { title: "BALANCES", disabled: false },
  { title: "HISTORY", disabled: false },
];

const orderColumnHelper = createColumnHelper<SpotMarketOrder>();
const tradeColumnHelper = createColumnHelper<SpotMarketTrade>();
const balanceColumnHelper = createColumnHelper<{ asset: Token; balance: string; assetId: string }>();

const ORDER_COLUMNS = (vm: ReturnType<typeof useSpotTableVMProvider>, theme: Theme) => [
  orderColumnHelper.accessor("timestamp", {
    header: "Date",
    cell: (props) => props.getValue().format("DD MMM YY, HH:mm"),
  }),
  orderColumnHelper.accessor("marketSymbol", {
    header: "Pair",
  }),
  orderColumnHelper.accessor("type", {
    header: "Type",
    cell: (props) => (
      <TableText color={props.getValue() === "SELL" ? theme.colors.redLight : theme.colors.greenLight}>
        {props.getValue()}
      </TableText>
    ),
  }),
  orderColumnHelper.accessor("baseSizeUnits", {
    header: "Amount",
    cell: (props) => (
      <SmartFlex center="y" gap="4px">
        <TableText primary>{props.getValue().toSignificant(2)}</TableText>
        <TokenBadge>
          <Text>{props.row.original.baseToken.symbol}</Text>
        </TokenBadge>
      </SmartFlex>
    ),
  }),
  orderColumnHelper.accessor("priceUnits", {
    header: "Price",
    cell: (props) => toCurrency(props.getValue().toSignificant(2)),
  }),
  orderColumnHelper.accessor("id", {
    header: "",
    id: "action",
    cell: (props) => (
      <CancelButton onClick={() => vm.cancelOrder(props.getValue())}>
        {vm.cancelingOrderId === props.getValue() ? "Loading..." : "Cancel"}
      </CancelButton>
    ),
  }),
];

const HISTORY_COLUMNS = (theme: Theme) => [
  tradeColumnHelper.accessor("timestamp", {
    header: "Date",
    cell: (props) => props.getValue().format("DD MMM YY, HH:mm"),
  }),
  tradeColumnHelper.accessor("marketSymbol", {
    header: "Pair",
  }),
  tradeColumnHelper.accessor("type", {
    header: "Type",
    cell: (props) => (
      <TableText color={props.getValue() === "SELL" ? theme.colors.redLight : theme.colors.greenLight}>
        {props.getValue()}
      </TableText>
    ),
  }),
  tradeColumnHelper.accessor("formatTradeAmount", {
    header: "Amount",
    cell: (props) => (
      <SmartFlex center="y" gap="4px">
        <TableText primary>{props.getValue()}</TableText>
        <TokenBadge>
          <Text>{props.row.original.baseToken.symbol}</Text>
        </TokenBadge>
      </SmartFlex>
    ),
  }),
  tradeColumnHelper.accessor("formatPrice", {
    header: "Price",
    cell: (props) => toCurrency(props.getValue()),
  }),
  tradeColumnHelper.accessor("formatTradeAmount", {
    id: "filled",
    header: "Filled",
  }),
];

const BALANCE_COLUMNS = [
  balanceColumnHelper.accessor("asset", {
    header: "Asset",
    cell: (props) => (
      <Row alignItems="center">
        <TokenIcon alt="market-icon" src={props.getValue().logo} />
        <SizedBox width={4} />
        {props.getValue().symbol}
      </Row>
    ),
  }),
  balanceColumnHelper.accessor("balance", {
    header: "Balance",
  }),
  balanceColumnHelper.accessor("assetId", {
    header: "",
    cell: (props) => <MintButtons assetId={props.getValue()} />,
  }),
];

// todo: Упростить логику разделить формирование данных и рендер для декстопа и мобилок
const SpotTableImpl: React.FC = observer(() => {
  const { balanceStore, faucetStore, blockchainStore } = useStores();
  const bcNetwork = blockchainStore.currentInstance;

  const vm = useSpotTableVMProvider();
  const theme = useTheme();
  const media = useMedia();

  const [tabIndex, setTabIndex] = useState(0);
  const columns = [ORDER_COLUMNS(vm, theme), BALANCE_COLUMNS, HISTORY_COLUMNS(theme)];

  const balanceData = Array.from(balanceStore.balances)
    .filter(([, balance]) => balance && balance.gt(0))
    .map(([assetId, balance]) => {
      const token = bcNetwork!.getTokenByAssetId(assetId);
      return {
        asset: token,
        balance: BN.formatUnits(balance, token.decimals).toSignificant(2),
        assetId,
      };
    });

  const renderMobileRows = () => {
    const orderData = vm.myOrders.map((ord, i) => (
      <MobileTableOrderRow key={i + "mobile-row"}>
        <MobileTableRowColumn>
          <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
            {ord.marketSymbol}
          </Text>
          <SmartFlex gap="2px" column>
            <Text type={TEXT_TYPES.SUPPORTING}>Amount</Text>
            <SmartFlex center="y" gap="4px">
              <Text color={theme.colors.textPrimary}>{ord.baseSizeUnits.toSignificant(2)}</Text>
              <TokenBadge>
                <Text>{ord.baseToken.symbol}</Text>
              </TokenBadge>
            </SmartFlex>
          </SmartFlex>
        </MobileTableRowColumn>
        <MobileTableRowColumn>
          <Text color={theme.colors.textPrimary}>Active</Text>
          <SmartFlex gap="2px" column>
            <SmartFlex center="y" gap="4px">
              <Text type={TEXT_TYPES.SUPPORTING}>Side:</Text>
              <TableText color={ord.type === "SELL" ? theme.colors.redLight : theme.colors.greenLight}>
                {ord.type}
              </TableText>
            </SmartFlex>
          </SmartFlex>
        </MobileTableRowColumn>
        <MobileTableRowColumn>
          <CancelButton onClick={() => vm.cancelOrder(ord.id)}>
            {vm.cancelingOrderId === ord.id ? "Loading..." : "Cancel"}
          </CancelButton>
          <SmartFlex alignItems="flex-end" gap="2px" column>
            <Text type={TEXT_TYPES.SUPPORTING}>Price:</Text>
            <Text color={theme.colors.textPrimary}>{toCurrency(ord.priceUnits.toSignificant(2))}</Text>
          </SmartFlex>
        </MobileTableRowColumn>
      </MobileTableOrderRow>
    ));

    const orderHistoryData = vm.myOrdersHistory.map((ord, i) => (
      <MobileTableOrderRow key={i + "mobile-history-row"}>
        <MobileTableRowColumn>
          <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
            {ord.marketSymbol}
          </Text>
          <SmartFlex gap="2px" column>
            <Text type={TEXT_TYPES.SUPPORTING}>Amount</Text>
            <SmartFlex center="y" gap="4px">
              <Text color={theme.colors.textPrimary}>{ord.formatTradeAmount}</Text>
              <TokenBadge>
                <Text>{ord.baseToken.symbol}</Text>
              </TokenBadge>
            </SmartFlex>
          </SmartFlex>
        </MobileTableRowColumn>
        <MobileTableRowColumn>
          <Text color={theme.colors.textPrimary}>Complete</Text>
          <SmartFlex gap="2px" column>
            <SmartFlex center="y" gap="4px">
              <Text type={TEXT_TYPES.SUPPORTING}>Side:</Text>
              <TableText color={ord.type === "SELL" ? theme.colors.redLight : theme.colors.greenLight}>
                {ord.type}
              </TableText>
            </SmartFlex>
            <SmartFlex center="y" gap="4px">
              <Text type={TEXT_TYPES.SUPPORTING}>Filled:</Text>
              <SmartFlex center="y" gap="4px">
                <Text color={theme.colors.textPrimary}>{ord.formatTradeAmount}</Text>
                <TokenBadge>
                  <Text>{ord.baseToken.symbol}</Text>
                </TokenBadge>
              </SmartFlex>
            </SmartFlex>
          </SmartFlex>
        </MobileTableRowColumn>
        <MobileTableRowColumn>
          <SmartFlex alignItems="flex-end" gap="2px" column>
            <Text type={TEXT_TYPES.SUPPORTING}>Price:</Text>
            <Text color={theme.colors.textPrimary}>{toCurrency(ord.formatPrice)}</Text>
          </SmartFlex>
        </MobileTableRowColumn>
      </MobileTableOrderRow>
    ));

    const balanceData = Array.from(balanceStore.balances)
      .filter(([, balance]) => balance && balance.gt(0))
      .map(([assetId, balance], i) => {
        const token = bcNetwork!.getTokenByAssetId(assetId);
        return (
          <MobileTableOrderRow key={i + "mobile-row"}>
            <MobileTableRowColumn>
              <Text type={TEXT_TYPES.SUPPORTING}>Token</Text>
              <SmartFlex center="y" gap="4px">
                <TokenIcon alt="market-icon" src={token.logo} />
                <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
                  {token.symbol}
                </Text>
              </SmartFlex>
            </MobileTableRowColumn>
            <MobileTableRowColumn>
              <Text type={TEXT_TYPES.SUPPORTING}>Balance</Text>
              <Text color={theme.colors.textPrimary}>{BN.formatUnits(balance, token.decimals).toSignificant(2)}</Text>
            </MobileTableRowColumn>
            <MobileTableRowColumn>
              <CancelButton onClick={() => faucetStore.mintByAssetId(assetId)}>
                {faucetStore.loading && faucetStore.actionTokenAssetId === assetId ? "Loading..." : "Mint"}
              </CancelButton>
            </MobileTableRowColumn>
          </MobileTableOrderRow>
        );
      });

    const tabToData = [orderData, balanceData, orderHistoryData];

    return (
      <SmartFlex width="100%" column>
        {tabToData[tabIndex]}
      </SmartFlex>
    );
  };

  const tabToData = [vm.myOrders, balanceData, vm.myOrdersHistory];
  const data = tabToData[tabIndex];

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

    return <Table columns={columns[tabIndex] as any} data={data} />;
  };

  return (
    <>
      <BaseTable activeTab={tabIndex} tabs={TABS} onTabClick={setTabIndex}>
        {renderTable()}
      </BaseTable>
      {!!vm.myOrders.length && tabIndex === 0 && (
        //todo здесь была кнопка cancel all orders
        <TextGraph style={{ textAlign: "center" }}>Data provided by the Graph</TextGraph>
      )}
    </>
  );
});

export default SpotTableImpl;

export const TableText = styled(Text)`
  display: flex;
  align-items: center;
`;

const CancelButton = styled(Chip)`
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;

const TokenIcon = styled.img`
  width: 12px;
  height: 12px;
  border-radius: 50%;
`;

const MobileTableOrderRow = styled(SmartFlex)`
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

const TextGraph = styled(Text)`
  text-transform: uppercase;

  ${media.desktop} {
    display: none;
  }
`;
