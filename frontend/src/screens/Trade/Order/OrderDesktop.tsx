import styled from "@emotion/styled";
import { Row } from "@src/components/Flex";
import React from "react";
import TokenInput from "@components/TokenInput/TokenInput";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import Img from "@components/Img";
import wallet from "@src/assets/icons/wallet.svg";
import { useStores } from "@stores";
import Loading from "@components/Loading";

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
  const balance0 = accountStore.getFormattedBalance(vm.token0);
  const balance1 = accountStore.getFormattedBalance(vm.token1);
  console.log(vm.loading);
  return (
    <Root>
      <Column>
        <Row alignItems="center" justifyContent="space-between">
          <Text>Buy {vm.token0.symbol}</Text>
          {accountStore.isLoggedIn && (
            <Row alignItems="center" justifyContent="flex-end">
              <Img src={wallet} alt="wallet" />
              <SizedBox width={4} />
              <Text nowrap fitContent>
                {balance0} {vm.token0.symbol}
              </Text>
            </Row>
          )}
        </Row>
        <SizedBox height={24} />
        <TokenInput
          description="Price"
          decimals={vm.token1.decimals}
          amount={vm.buyPrice}
          setAmount={(v) => vm.setBuyPrice(v, true)}
          assetId={vm.assetId1}
        />
        <SizedBox height={12} />
        <TokenInput
          description="Amount"
          decimals={vm.token0.decimals}
          amount={vm.buyAmount}
          setAmount={(v) => vm.setBuyAmount(v, true)}
          assetId={vm.assetId0}
        />
        <SizedBox height={12} />
        <TokenInput
          description="Total"
          decimals={vm.token1.decimals}
          amount={vm.buyTotal}
          setAmount={(v) => vm.setBuyTotal(v, true)}
          assetId={vm.assetId1}
          error={vm.buyTotalError}
        />
        <SizedBox height={12} />
        {accountStore.isLoggedIn ? (
          <Button
            kind="green"
            fixed
            onClick={() => vm.createOrder("buy")}
            disabled={vm.loading || !vm.canBuy}
          >
            {vm.loading ? <Loading /> : `Buy ${vm.token1.symbol}`}
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
          <Text>Sell {vm.token0.symbol}</Text>
          {accountStore.isLoggedIn && (
            <Row alignItems="center" justifyContent="flex-end">
              <Img src={wallet} alt="wallet" />
              <SizedBox width={4} />
              <Text nowrap fitContent>
                {balance1} {vm.token1.symbol}
              </Text>
            </Row>
          )}
        </Row>
        <SizedBox height={24} />
        <TokenInput
          description="Price"
          decimals={vm.token1.decimals}
          amount={vm.sellPrice}
          setAmount={(v) => vm.setSellPrice(v, true)}
          assetId={vm.assetId1}
        />
        <SizedBox height={12} />
        <TokenInput
          description="Amount"
          decimals={vm.token0.decimals}
          amount={vm.sellAmount}
          setAmount={(v) => vm.setSellAmount(v, true)}
          assetId={vm.assetId0}
          error={vm.sellAmountError}
        />
        <SizedBox height={12} />
        <TokenInput
          description="Total"
          decimals={vm.token1.decimals}
          amount={vm.sellTotal}
          setAmount={(v) => vm.setSellTotal(v, true)}
          assetId={vm.assetId1}
        />
        <SizedBox height={12} />
        {accountStore.isLoggedIn ? (
          <Button
            kind="danger"
            fixed
            disabled={vm.loading || !vm.canSell}
            onClick={() => vm.createOrder("sell")}
          >
            {vm.loading ? <Loading /> : `Sell ${vm.token1.symbol}`}
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
