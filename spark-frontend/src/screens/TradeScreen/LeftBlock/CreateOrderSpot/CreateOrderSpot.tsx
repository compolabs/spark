import React, { ComponentProps, useEffect } from "react";
import styled from "@emotion/styled";
import { Accordion } from "@szhsin/react-accordion";
import { observer } from "mobx-react";

import AccordionItem from "@components/AccordionItem";
import { Column, Row } from "@components/Flex";
import MaxButton from "@components/MaxButton";
import Select from "@components/Select";
import SizedBox from "@components/SizedBox";
import Slider from "@components/Slider";
import Text, { TEXT_TYPES } from "@components/Text";
import TokenInput from "@components/TokenInput";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import Button, { ButtonGroup } from "@src/components/Button";
import { useMedia } from "@src/hooks/useMedia";
import {
  ORDER_MODE,
  ORDER_TYPE,
  useCreateOrderSpotVM,
} from "@src/screens/TradeScreen/LeftBlock/CreateOrderSpot/CreateOrderSpotVM";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface IProps extends ComponentProps<any> {}

const ORDER_OPTIONS = [
  { title: "Market", key: ORDER_TYPE.Market },
  { title: "Limit", key: ORDER_TYPE.Limit },
  { title: "Stop Market", key: ORDER_TYPE.StopMarket, disabled: true },
  { title: "Stop Limit", key: ORDER_TYPE.StopLimit, disabled: true },
  { title: "Take Profit", key: ORDER_TYPE.TakeProfit, disabled: true },
  { title: "Take Profit Limit", key: ORDER_TYPE.TakeProfitLimit, disabled: true },
];

const CreateOrderSpot: React.FC<IProps> = observer(({ ...rest }) => {
  const { balanceStore, tradeStore } = useStores();
  const vm = useCreateOrderSpotVM();
  const market = tradeStore.market;

  const media = useMedia();

  const isButtonDisabled = vm.loading || !vm.canProceed;

  useEffect(() => {
    if (vm.orderType === ORDER_TYPE.Market) {
      vm.setInputPrice(market?.price ?? BN.ZERO);
    }
  });

  if (!market) return null;

  const { baseToken, quoteToken } = market;

  const handlePercentChange = (v: number) => {
    const balance = balanceStore.getBalance(vm.isSell ? baseToken.assetId : quoteToken.assetId);

    if (balance.eq(BN.ZERO)) return;

    const value = BN.percentOf(balance, v);
    if (vm.isSell) {
      vm.setInputAmount(value, true);
      return;
    }

    vm.setInputTotal(value, true);
  };

  const handleSetOrderType = (type: ORDER_TYPE) => {
    vm.setOrderType(type);
  };

  const handleSetPrice = (amount: BN) => {
    if (vm.orderType === ORDER_TYPE.Market) return;

    vm.setInputPrice(amount, true);
  };

  const isInputPriceDisabled = vm.orderType !== ORDER_TYPE.Limit;

  const renderButton = () => {
    if (!vm.tokenIsApproved) {
      return (
        <Button disabled={isButtonDisabled} green={!vm.isSell} red={vm.isSell} onClick={vm.approve}>
          {vm.loading ? "Loading..." : `Approve ${vm.isSell ? baseToken.symbol : quoteToken.symbol}`}
        </Button>
      );
    }

    return (
      <Button disabled={isButtonDisabled} green={!vm.isSell} red={vm.isSell} onClick={vm.createOrder}>
        {vm.loading ? "Loading..." : vm.isSell ? `Sell ${baseToken.symbol}` : `Buy ${baseToken.symbol}`}
      </Button>
    );
  };

  return (
    <Root {...rest}>
      <ButtonGroup>
        <Button active={!vm.isSell} onClick={() => vm.setOrderMode(ORDER_MODE.BUY)}>
          BUY
        </Button>
        <Button active={vm.isSell} onClick={() => vm.setOrderMode(ORDER_MODE.SELL)}>
          SELL
        </Button>
      </ButtonGroup>
      <SizedBox height={16} />
      <Row>
        <Column crossAxisSize="max">
          <Select
            label="Order type"
            options={ORDER_OPTIONS}
            selected={vm.orderType}
            onSelect={({ key }) => handleSetOrderType(key)}
          />
          <SizedBox height={2} />
          <Row alignItems="center">
            <StyledInfoIcon />
            <Text type={TEXT_TYPES.SUPPORTING} disabled>
              {media.desktop ? "About order type" : "Info"}
            </Text>
          </Row>
        </Column>
        <SizedBox width={8} />
        <TokenInput
          amount={vm.inputPrice}
          decimals={9}
          disabled={isInputPriceDisabled}
          label="Price"
          setAmount={handleSetPrice}
        />
      </Row>
      <SizedBox height={2} />
      <Row alignItems="flex-end">
        <TokenInput
          amount={vm.inputAmount}
          assetId={baseToken.assetId}
          decimals={baseToken.decimals}
          error={vm.isSell ? vm.inputTotalError : undefined}
          label="Order size"
          setAmount={(v) => vm.setInputAmount(v, true)}
          // errorMessage="Insufficient amount"
        />
        <SizedBox width={8} />
        <Column alignItems="flex-end" crossAxisSize="max">
          <MaxButton fitContent onClick={vm.onMaxClick}>
            MAX
          </MaxButton>
          <SizedBox height={4} />
          <TokenInput
            amount={vm.inputTotal}
            assetId={quoteToken.assetId}
            decimals={quoteToken.decimals}
            error={vm.isSell ? undefined : vm.inputTotalError}
            setAmount={(v) => vm.setInputTotal(v, true)}
            // errorMessage="Insufficient amount"
          />
        </Column>
      </Row>
      <SizedBox height={4} />
      <Row alignItems="center" justifyContent="space-between">
        <Text type={TEXT_TYPES.SUPPORTING}>Available</Text>
        <Row alignItems="center" mainAxisSize="fit-content">
          <Text type={TEXT_TYPES.BODY} primary>
            {balanceStore.getFormatBalance(
              vm.isSell ? baseToken.assetId : quoteToken.assetId,
              vm.isSell ? baseToken.decimals : quoteToken.decimals,
            )}
          </Text>
          <Text type={TEXT_TYPES.SUPPORTING}>&nbsp;{vm.isSell ? baseToken.symbol : quoteToken.symbol}</Text>
        </Row>
      </Row>
      {/*<Button onClick={vm.setupMarketMakingAlgorithm}>Setup market making algorithm</Button>*/}
      <SizedBox height={media.desktop ? 28 : 8} />
      <Slider
        max={100}
        min={0}
        percent={vm.inputPercent.toNumber()}
        step={1}
        value={vm.inputPercent.toNumber()}
        onChange={(v) => handlePercentChange(v as number)}
      />
      <SizedBox height={media.desktop ? 28 : 8} />
      <Accordion transitionTimeout={400} transition>
        <AccordionItem
          header={
            <Row alignItems="center" justifyContent="space-between" mainAxisSize="stretch">
              <Text type={TEXT_TYPES.BUTTON_SECONDARY} nowrap primary>
                Order Details
              </Text>
              <Row alignItems="center" justifyContent="flex-end">
                <Text primary>{BN.formatUnits(vm.inputAmount, baseToken.decimals).toFormat(2)}</Text>
                <Text>&nbsp;{baseToken.symbol}</Text>
              </Row>
            </Row>
          }
          defaultChecked
          initialEntered
        >
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Max {vm.isSell ? "sell" : "buy"}</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>{BN.formatUnits(vm.inputTotal, quoteToken.decimals).toFormat(2)}</Text>
              <Text>&nbsp;{quoteToken.symbol}</Text>
            </Row>
          </Row>
          <SizedBox height={8} />
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Matcher Fee</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>0.000001</Text>
              <Text>&nbsp;ETH</Text>
            </Row>
          </Row>
          <SizedBox height={8} />
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Total amount</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>{BN.formatUnits(vm.inputAmount, baseToken.decimals).toFormat(2)}</Text>
              <Text>&nbsp;{baseToken.symbol}</Text>
            </Row>
          </Row>
        </AccordionItem>
      </Accordion>
      <SizedBox height={16} />
      {renderButton()}
    </Root>
  );
});

export default CreateOrderSpot;

const Root = styled.div`
  padding: 12px;
  width: 100%;
`;

const StyledInfoIcon = styled(InfoIcon)`
  margin-right: 2px;

  path {
    fill: ${({ theme }) => theme.colors.textDisabled};
  }
`;
