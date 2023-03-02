import styled from "@emotion/styled";
import { Row } from "@src/components/Flex";
import React, { useState } from "react";
import TokenInput from "@components/TokenInput/TokenInput";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import Img from "@components/Img";
import wallet from "@src/assets/icons/wallet.svg";
import Slider from "@src/components/Slider";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: 880px) {
    flex-direction: row;
  }

  background: #222936;
  grid-area: order;
  padding: 13px;
  box-sizing: border-box;
`;
const Column = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const OrderDesktop: React.FC<IProps> = () => {
  const vm = useTradeVM();
  const { accountStore, settingsStore } = useStores();
  const [percent, setPercent] = useState<number | number[]>(100);
  return (
    <Root>
      <Column>
        <Row alignItems="center" justifyContent="space-between">
          <Text>Buy {vm.token0.symbol}</Text>
          <Row alignItems="center" justifyContent="flex-end">
            <Img src={wallet} alt="wallet" />
            <SizedBox width={4} />
            <Text fitContent>0.001 {vm.token0.symbol}</Text>
          </Row>
        </Row>
        <SizedBox height={24} />
        <TokenInput
          description="Price"
          decimals={vm.token0.decimals}
          amount={vm.amount0}
          setAmount={vm.setAmount0}
          assetId={vm.assetId0}
        />
        <SizedBox height={12} />
        <TokenInput
          description="Amount"
          decimals={vm.token0.decimals}
          amount={vm.amount0}
          setAmount={vm.setAmount0}
          assetId={vm.assetId0}
        />
        <SizedBox height={12} />
        <Slider
          min={0}
          max={100}
          step={1}
          marks={{ 0: 0, 25: 25, 50: 50, 75: 75, 100: 100 }}
          value={percent}
          onChange={setPercent}
        />
        <SizedBox height={12} />
        <TokenInput
          description="Total"
          decimals={vm.token0.decimals}
          amount={vm.amount0}
          setAmount={vm.setAmount0}
          assetId={vm.assetId0}
        />
        <SizedBox height={12} />
        {accountStore.isLoggedIn ? (
          <Button kind="green" fixed>
            Buy {vm.token1.symbol}
          </Button>
        ) : (
          <Button fixed onClick={() => settingsStore.setLoginModalOpened(true)}>
            Connect wallet
          </Button>
        )}
      </Column>
      <SizedBox width={24} />
      <Column>
        <Row alignItems="center" justifyContent="space-between">
          <Text>Sell {vm.token1.symbol}</Text>
          <Row alignItems="center" justifyContent="flex-end">
            <Img src={wallet} alt="wallet" />
            <SizedBox width={4} />
            <Text fitContent>0.001 {vm.token1.symbol}</Text>
          </Row>
        </Row>
        <SizedBox height={24} />
        <TokenInput
          description="Price"
          decimals={vm.token1.decimals}
          amount={vm.amount1}
          setAmount={vm.setAmount1}
          assetId={vm.assetId1}
        />
        <SizedBox height={12} />
        <TokenInput
          description="Amount"
          decimals={vm.token1.decimals}
          amount={vm.amount1}
          setAmount={vm.setAmount1}
          assetId={vm.assetId1}
        />
        <SizedBox height={12} />
        <Slider
          min={0}
          max={100}
          step={1}
          marks={{ 0: 0, 25: 25, 50: 50, 75: 75, 100: 100 }}
          value={percent}
          onChange={setPercent}
        />
        <SizedBox height={12} />
        <TokenInput
          description="Total"
          decimals={vm.token1.decimals}
          amount={vm.amount1}
          setAmount={vm.setAmount1}
          assetId={vm.assetId1}
        />
        <SizedBox height={12} />
        {accountStore.isLoggedIn ? (
          <Button kind="danger" fixed>
            Sell {vm.token1.symbol}{" "}
          </Button>
        ) : (
          <Button fixed onClick={() => settingsStore.setLoginModalOpened(true)}>
            Connect wallet
          </Button>
        )}
      </Column>
    </Root>
  );
};
export default observer(OrderDesktop);
