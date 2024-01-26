import React, { ComponentProps, useEffect, useState } from "react";
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
import { ORDER_MODE, useCreateOrderSpotVM } from "@screens/TradeScreen/LeftBlock.tsx/CreateOrderSpot/CreateOrderSpotVM";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import Button, { ButtonGroup } from "@src/components/Button";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface IProps extends ComponentProps<any> {}

const Root = styled.div`
  padding: 12px;
`;

const StyledInfoIcon = styled(InfoIcon)`
  margin-right: 2px;

  path {
    fill: ${({ theme }) => theme.colors.textDisabled};
  }
`;

const orderTypes = [
  { title: "Market", key: "market", disabled: true },
  { title: "Limit", key: "limit" },
  { title: "Stop Market", key: "stopmarket", disabled: true },
  { title: "Stop Limit", key: "stoplimit", disabled: true },
  { title: "Take Profit", key: "takeprofit", disabled: true },
  { title: "Take Profit Limit", key: "takeprofitlimit", disabled: true },
];

const CreateOrderSpot: React.FC<IProps> = observer(({ ...rest }) => {
  const { balanceStore, tradeStore } = useStores();
  const vm = useCreateOrderSpotVM();
  const [percent, setPercent] = useState(0);
  const market = tradeStore.market;

  const isButtonDisabled = vm.loading || !vm.canProceed;

  useEffect(() => {
    if (!market) return;

    const balance = balanceStore.getBalance(vm.isSell ? market.baseToken.assetId : market.quoteToken.assetId);

    if (!balance) return;

    if (balance.eq(0)) {
      setPercent(0);
    } else {
      setPercent(vm.inputTotal.div(balance).times(100).toNumber());
    }
  }, [balanceStore, vm.inputTotal, vm.isSell, vm.inputAmount]);

  if (!market) return null;

  const { baseToken, quoteToken } = market;

  const handlePercentChange = (v: number) => {
    setPercent(v);
    const balance = balanceStore.getBalance(vm.isSell ? baseToken.assetId : quoteToken.assetId);

    if (!balance) return;

    const value = balance.times(v / 100).toNumber();
    vm.setInputTotal(new BN(value), true);
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
          <Select label="Order type" options={orderTypes} selected={orderTypes[1].key} onSelect={() => null} />
          <SizedBox height={2} />
          <Row alignItems="center">
            <StyledInfoIcon />
            <Text type={TEXT_TYPES.SUPPORTING} disabled>
              About order type
            </Text>
          </Row>
        </Column>
        <SizedBox width={8} />
        <TokenInput
          amount={vm.inputPrice}
          decimals={9}
          label="Market price"
          setAmount={(v) => vm.setInputPrice(v, true)}
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
          {/*todo починить функционал кнопки max*/}
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
      <SizedBox height={28} />
      <Slider
        max={100}
        min={0}
        percent={percent}
        step={1}
        value={percent}
        onChange={(v) => handlePercentChange(v as number)}
      />
      <SizedBox height={28} />
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
            <Text nowrap>Max buy</Text>
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
      <Button disabled={isButtonDisabled} green={!vm.isSell} red={vm.isSell} onClick={vm.createOrder}>
        {vm.loading ? "Loading..." : vm.isSell ? `Sell ${baseToken.symbol}` : `Buy ${baseToken.symbol}`}
      </Button>
    </Root>
  );
});
export default CreateOrderSpot;
