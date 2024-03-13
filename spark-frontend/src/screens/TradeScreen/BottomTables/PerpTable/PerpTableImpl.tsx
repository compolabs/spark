import React, { useState } from "react";
import { Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { createColumnHelper } from "@tanstack/react-table";
import { observer } from "mobx-react";

import Chip from "@components/Chip";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import MintButtons from "@screens/Faucet/MintButtons";
import { Row } from "@src/components/Flex";
import { SmartFlex } from "@src/components/SmartFlex";
import Table from "@src/components/Table";
import TOKEN_LOGOS from "@src/constants/tokenLogos";
import { Token } from "@src/entity";
import useFlag from "@src/hooks/useFlag";
import { useMedia } from "@src/hooks/useMedia";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

import { BaseTable } from "../BaseTable";

import { usePerpTableVMProvider } from "./PerpTableVM";
import TakeProfitStopLossSheet from "./TakeProfitStopLossSheet";

const TABS = [
  { title: "POSITIONS", disabled: false },
  { title: "BALANCES", disabled: false },
  // { title: "ORDERS", disabled: true },
  // { title: "TRADES", disabled: true },
  // { title: "UNSETTLED P&L", disabled: true },
  // { title: "HISTORY", disabled: true },
];

interface PerpMarketTrade {
  id: string;
  pair: string;
  type: "LONG" | "SHORT";
  leverage: string;
  baseToken: string;
  quoteToken: string;
  size: string;
  value: string;
  margin: string;
  entry: string;
  mark: string;
  liqPrice: string;
  unrealizedPnl: string;
  unrealizedPnlPercent: string;
  fundingPayment: string;
  isTpSlActive: boolean;
  takeProfit: string;
  stopLoss: string;
}

interface PositionColumnParams {
  vm: ReturnType<typeof usePerpTableVMProvider>;
  theme: Theme;
  onTpSlClick: () => void;
}

const positionColumnHelper = createColumnHelper<PerpMarketTrade>();
const balanceColumnHelper = createColumnHelper<{ asset: Token; balance: string; assetId: string }>();

const POSITIONS_COLUMNS = (params: PositionColumnParams) => [
  positionColumnHelper.accessor("pair", {
    header: "Trading Pair",
    cell: (props) => (
      <SmartFlex gap="4px">
        <TokenIcon alt="ETH-USDC" height={16} src={TOKEN_LOGOS["ETH"]} width={16} />
        <SmartFlex column>
          <Text>ETH-USDC</Text>
          <Text color={params.theme.colors.greenLight}>20х Long</Text>
        </SmartFlex>
      </SmartFlex>
    ),
  }),
  positionColumnHelper.accessor("size", {
    header: "Size / Value",
    cell: (props) => (
      <SmartFlex column>
        <SmartFlex center="y" gap="4px">
          <Text primary>0.89</Text>
          <TokenBadge>
            <Text>ETH</Text>
          </TokenBadge>
        </SmartFlex>
        <Text primary>1719.21</Text>
      </SmartFlex>
    ),
  }),
  positionColumnHelper.accessor("margin", {
    header: "Margin",
    cell: (props) => (
      <SmartFlex alignSelf="flex-start" center="y" gap="4px" height="100%">
        <Text primary>75.6255</Text>
        <TokenBadge>
          <Text>USDC</Text>
        </TokenBadge>
      </SmartFlex>
    ),
  }),
  positionColumnHelper.accessor("entry", {
    header: "Entry / Mark",
    cell: (props) => (
      <SmartFlex center="y" gap="2px" column>
        <Text primary>1720.23</Text>
        <Text primary>1789.80</Text>
      </SmartFlex>
    ),
  }),
  positionColumnHelper.accessor("liqPrice", {
    header: "Liq. Price",
    cell: (props) => <Text primary>1720.23</Text>,
  }),
  positionColumnHelper.accessor("unrealizedPnl", {
    header: "Unrealized PNL",
    cell: (props) => (
      <SmartFlex column>
        <SmartFlex center="y" gap="4px">
          <Text color={params.theme.colors.greenLight} primary>
            64.1617
          </Text>
          <TokenBadge>
            <Text>USDC</Text>
          </TokenBadge>
        </SmartFlex>
        <Text color={params.theme.colors.greenLight}>85.52%</Text>
      </SmartFlex>
    ),
  }),
  positionColumnHelper.accessor("fundingPayment", {
    header: "Funding payment",
    cell: (props) => (
      <SmartFlex center="y" gap="4px">
        <Text color={params.theme.colors.greenLight} primary>
          78.2131
        </Text>
        <TokenBadge>
          <Text>USDC</Text>
        </TokenBadge>
      </SmartFlex>
    ),
  }),
  positionColumnHelper.accessor("id", {
    header: "",
    cell: (props) => (
      <SmartFlex center="y" gap="4px">
        <CancelButton onClick={() => params.vm.cancelOrder(props.getValue())}>
          {params.vm.cancelingOrderId === props.getValue() ? "Loading..." : "Close"}
        </CancelButton>
        <CancelButton onClick={params.onTpSlClick}>TP/SL</CancelButton>
      </SmartFlex>
    ),
  }),
];

const BALANCE_COLUMNS = [
  balanceColumnHelper.accessor("asset", {
    header: "Asset",
    cell: (props) => {
      console.log(props.getValue());
      return (
        <Row alignItems="center">
          <TokenIcon alt="market-icon" src={props.getValue().logo} />
          <SizedBox width={4} />
          123123
          {props.getValue().symbol}
        </Row>
      );
    },
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
const PerpTableImpl: React.FC = observer(() => {
  const { balanceStore, faucetStore, blockchainStore } = useStores();
  const bcNetwork = blockchainStore.currentInstance;

  const vm = usePerpTableVMProvider();
  const theme = useTheme();
  const media = useMedia();

  const [isTpSlSheetOpen, openTpSlSheet, closeTpSlSheet] = useFlag();

  const [tabIndex, setTabIndex] = useState(0);
  const columns = [POSITIONS_COLUMNS({ vm, theme, onTpSlClick: openTpSlSheet }), BALANCE_COLUMNS];

  const [isTpSlActive, setTpSlActive] = useState(false);

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

  const handleTpSlChange = () => {
    setTpSlActive((state) => !state);
  };

  const renderMobileRows = () => {
    const orderData = vm.myPositions.map((ord, i) => (
      <MobileTablePositionRow key={i + "mobile-row"}>
        <SmartFlex gap="1px" column>
          <SmartFlex center="y" gap="8px">
            <SmartFlex center="y" gap="4px">
              <TokenIcon alt="ETH-USDC" src={TOKEN_LOGOS["ETH"]} />
              <Text primary>ETH-USDC</Text>
            </SmartFlex>
            <Text color={theme.colors.greenLight}>20x Long</Text>
          </SmartFlex>
          <SmartFlex center="y" gap="4px">
            <Text>Size:</Text>
            <Text primary>0.89</Text>
            <TokenBadge>
              <Text>ETH</Text>
            </TokenBadge>
          </SmartFlex>
          <SmartFlex center="y" gap="4px">
            <Text>Value:</Text>
            <Text primary>1719.21</Text>
          </SmartFlex>
          <SmartFlex center="y" gap="4px">
            <Text>Margin:</Text>
            <Text primary>75.6255</Text>
            <TokenBadge>
              <Text>USDC</Text>
            </TokenBadge>
          </SmartFlex>
          <SmartFlex column>
            <Text>Unrealized PNL:</Text>
            <SmartFlex center="y" gap="4px">
              <Text primary>64.1617</Text>
              <TokenBadge>
                <Text>USDC</Text>
              </TokenBadge>
              <Text primary>85.52%</Text>
            </SmartFlex>
          </SmartFlex>
        </SmartFlex>
        <SmartFlex gap="2px" margin="0 0 0 8px" column>
          <SmartFlex center="y" gap="4px">
            <CancelButton onClick={() => vm.cancelOrder("")}>Close</CancelButton>
            <CancelButton onClick={openTpSlSheet}>TP/SL</CancelButton>
          </SmartFlex>
          <SmartFlex center="y" gap="4px">
            <Text>Entry Price:</Text>
            <Text primary>1720.23</Text>
          </SmartFlex>
          <SmartFlex center="y" gap="4px">
            <Text>Mark Price:</Text>
            <Text primary>1789.80</Text>
          </SmartFlex>
          <SmartFlex center="y" gap="4px">
            <Text>Liq. Price:</Text>
            <Text primary>1720.23</Text>
          </SmartFlex>
          <SmartFlex column>
            <Text>Funding payment:</Text>
            <SmartFlex center="y" gap="4px">
              <Text primary>78.2131</Text>
              <TokenBadge>
                <Text>USDC</Text>
              </TokenBadge>
            </SmartFlex>
          </SmartFlex>
        </SmartFlex>
      </MobileTablePositionRow>
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
                <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
                  {token.symbol}
                </Text>
              </SmartFlex>
            </MobileTableRowColumn>
            <MobileTableRowColumn>
              <Text type={TEXT_TYPES.SUPPORTING}>Balance</Text>
              <Text primary>{BN.formatUnits(balance, token.decimals).toSignificant(2)}</Text>
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

  const tabToData = [vm.myPositions, balanceData];
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
      {!!vm.myPositions.length && tabIndex === 0 && (
        <TextGraph style={{ textAlign: "center" }}>Data provided by the Graph</TextGraph>
      )}

      <TakeProfitStopLossSheet
        isOpen={isTpSlSheetOpen}
        isTpSlActive={isTpSlActive}
        onClose={closeTpSlSheet}
        onToggleTpSl={handleTpSlChange}
      />
    </>
  );
});

export default PerpTableImpl;

const CancelButton = styled(Chip)`
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;

const TokenIcon = styled.img`
  width: 16px;
  height: 16px;
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

const MobileTablePositionRow = styled(SmartFlex)`
  display: grid;
  grid-template-columns: 1fr max-content;
  width: 100%;
  padding: 11px 7px 14px 7px;
  background: ${({ theme }) => theme.colors.bgPrimary};

  position: relative;

  ${SmartFlex}:last-of-type {
    margin-right: 8px;
  }

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
