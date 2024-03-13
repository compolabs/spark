import React, { useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Chip from "@components/Chip";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import MintButtons from "@screens/Faucet/MintButtons";
import { Row } from "@src/components/Flex";
import { SmartFlex } from "@src/components/SmartFlex";
import Table from "@src/components/Table";
import { useMedia } from "@src/hooks/useMedia";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";
import { toCurrency } from "@src/utils/toCurrency";
import { useStores } from "@stores";

import { BaseTable } from "../BaseTable";

import { usePerpTableVMProvider } from "./PerpTableVM";

const TABS = [
  { title: "POSITIONS", disabled: false },
  { title: "BALANCES", disabled: false },
  // { title: "ORDERS", disabled: true },
  // { title: "TRADES", disabled: true },
  // { title: "UNSETTLED P&L", disabled: true },
  // { title: "HISTORY", disabled: true },
];

const POSITIONS_COLUMNS = [
  { header: "Trading Pair", accessorKey: "pair" },
  { header: "Size / Value", accessorKey: "sizeValue" },
  { header: "Margin", accessorKey: "margin" },
  {
    header: "Entry / Mark",
    accessorKey: "entryMark",
    tooltip: (
      <>
        <Text type={TEXT_TYPES.BODY}>
          Amount represents the quantity of cryptocurrency tokens bought or sold in a transaction on the exchange.
        </Text>
        <Text type={TEXT_TYPES.BODY}>For buys, it shows tokens acquired; for sells, tokens sold.</Text>
      </>
    ),
  },
  { header: "Liq. Price", accessorKey: "liqPrice" },
  { header: "Unrealized PNL", accessorKey: "unrealizedPnl" },
  { header: "Funding payment", accessorKey: "fundingPayment" },
  { header: "", accessorKey: "action" },
];

const BALANCE_COLUMNS = [
  { header: "Asset", accessorKey: "asset" },
  { header: "Balance", accessorKey: "balance" },
  { header: "", accessorKey: "buttons" },
];

const COLUMNS = [POSITIONS_COLUMNS, BALANCE_COLUMNS];

// todo: Упростить логику разделить формирование данных и рендер для декстопа и мобилок
const PerpTableImpl: React.FC = observer(() => {
  const { balanceStore, faucetStore, blockchainStore } = useStores();
  const bcNetwork = blockchainStore.currentInstance;

  const vm = usePerpTableVMProvider();
  const theme = useTheme();
  const media = useMedia();

  const [tabIndex, setTabIndex] = useState(0);

  const getPositionData = () =>
    vm.myPositions.map((order) => ({
      date: order.timestamp.format("DD MMM YY, HH:mm"),
      pair: order.marketSymbol,
      type: (
        <TableText color={order.type === "SELL" ? theme.colors.redLight : theme.colors.greenLight}>
          {order.type}
        </TableText>
      ),
      amount: (
        <SmartFlex center="y" gap="4px">
          <TableText primary>{order.baseSizeUnits.toSignificant(2)}</TableText>
          <TokenBadge>
            <Text>{order.baseToken.symbol}</Text>
          </TokenBadge>
        </SmartFlex>
      ),
      price: toCurrency(order.priceUnits.toSignificant(2)),
      action: (
        <CancelButton onClick={() => vm.cancelOrder(order.id)}>
          {vm.cancelingOrderId === order.id ? "Loading..." : "Cancel"}
        </CancelButton>
      ),
    }));

  const getBalanceData = () =>
    Array.from(balanceStore.balances)
      .filter(([, balance]) => balance && balance.gt(0))
      .map(([assetId, balance]) => {
        const token = bcNetwork!.getTokenByAssetId(assetId);
        return {
          asset: (
            <Row alignItems="center">
              <TokenIcon alt="market-icon" src={token.logo} />
              <SizedBox width={4} />
              {token.symbol}
            </Row>
          ),
          balance: BN.formatUnits(balance, token.decimals).toSignificant(2),
          buttons: <MintButtons assetId={assetId} />,
        };
      });

  const renderMobileRows = () => {
    const orderData = vm.myPositions.map((ord, i) => (
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

    const tabToData = [orderData, balanceData];

    return (
      <SmartFlex width="100%" column>
        {tabToData[tabIndex]}
      </SmartFlex>
    );
  };

  const tabToData = [getPositionData, getBalanceData];
  const data = tabToData[tabIndex]();

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
        // style={{
        //   whiteSpace: "nowrap",
        //   width: "fitContent",
        //   minWidth: "fit-content",
        // }}
      />
    );
  };

  return (
    <>
      <BaseTable activeTab={tabIndex} tabs={TABS} onTabClick={setTabIndex}>
        {renderTable()}
      </BaseTable>
      {!!vm.myPositions.length && tabIndex === 0 && (
        <TextGraph style={{ textAlign: "center" }}>Data provided by the Graph</TextGraph>
      )}
    </>
  );
});

export default PerpTableImpl;

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
