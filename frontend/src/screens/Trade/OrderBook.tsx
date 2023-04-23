import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import { observer } from "mobx-react-lite";
import sell from "@src/assets/icons/sellOrderBookIcon.svg";
import buy from "@src/assets/icons/buyOrderBookIcon.svg";
import sellAndBuy from "@src/assets/icons/buyAndSellOrderBookIcon.svg";
import Divider from "@src/components/Divider";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { useTradeVM } from "@screens/Trade/TradeVm";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import Skeleton from "react-loading-skeleton";
import Button from "@components/Button";
import Select from "@src/components/Select";
import { Row } from "@src/components/Flex";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  background: #222936;
  grid-area: orderbook;
  padding: 8px 12px;
`;

const Settings = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
`;
const Icon = styled.img<{ selected?: boolean }>`
  cursor: pointer;
  margin-right: 8px;
  ${({ selected }) => selected && "background: #3A4050; border-radius: 4px;"};
`;
const OrderRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  cursor: pointer;

  text-align: center;

  p:last-of-type {
    text-align: end;
  }

  p:first-of-type {
    text-align: start;
  }

  :hover {
    background: #323846;
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
`;
const roundOptions = [4, 5, 6].map((v) => ({
  title: `${v} decimals`,
  key: v.toString(),
}));
const OrderBook: React.FC<IProps> = () => {
  const vm = useTradeVM();
  const [round, setRound] = useState("4");
  const { ordersStore, accountStore, settingsStore } = useStores();
  const [orderFilter, setOrderFilter] = useState(0);
  const activeOrdersForCurrentPair = ordersStore.activeOrders.filter(
    (o) =>
      (vm.assetId1 === o.asset0 && vm.assetId0 === o.asset1) ||
      (vm.assetId1 === o.asset1 && vm.assetId0 === o.asset0)
  );

  const buyOrders = activeOrdersForCurrentPair
    .filter((o) => o.asset0 === vm.assetId0)
    .sort((a, b) => {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null && b.price != null) return 1;
      if (a.price == null && b.price == null) return -1;
      return a.price!.lt(b.price!) ? 1 : -1;
    })
    .slice(orderFilter === 0 ? -12 : -25);

  const sellOrders = activeOrdersForCurrentPair
    .filter((o) => o.asset0 === vm.assetId1)
    .sort((a, b) => {
      if (a.reversePrice == null && b.reversePrice == null) return 0;
      if (a.reversePrice == null && b.reversePrice != null) return 1;
      if (a.reversePrice == null && b.reversePrice == null) return -1;
      return a.reversePrice!.lt(b.reversePrice!) ? -1 : 1;
    })
    .slice(orderFilter === 0 ? -12 : -25);

  const filters = [sellAndBuy, buy, sell];
  const columns = [
    `Price ${vm.token1.symbol}`,
    `Amount ${vm.token0.symbol}`,
    `Total ${vm.token1.symbol}`,
  ];

  if (!accountStore.isLoggedIn)
    return (
      <Root style={{ justifyContent: "center", alignItems: "center" }}>
        <Text textAlign="center">Connect wallet to see orders</Text>
        <SizedBox height={12} />
        <Button onClick={() => settingsStore.setLoginModalOpened(true)}>
          Connect wallet
        </Button>
      </Root>
    );
  return (
    <Root>
      {/*Todo */}
      <Row justifyContent="space-between" alignItems="center">
        <Settings>
          {filters.map((image, index) => (
            <Icon
              key={index}
              src={image}
              alt="filter"
              selected={orderFilter === index}
              onClick={() => ordersStore.initialized && setOrderFilter(index)}
            />
          ))}
        </Settings>

        <Select
          options={roundOptions}
          selected={roundOptions.find(({ key }) => key === round)}
          onSelect={({ key }) => setRound(key)}
        />
      </Row>
      <SizedBox height={8} />
      <Divider />
      <OrderRow>
        {columns.map((v) => (
          <Text size="small" key={v} type="secondary">
            {v}
          </Text>
        ))}
      </OrderRow>
      <Divider />
      <SizedBox height={8} />
      <Container>
        {!ordersStore.initialized ? (
          <Skeleton height={20} style={{ marginBottom: 4 }} count={13} />
        ) : (
          orderFilter !== 2 &&
          buyOrders.map((o, index) => (
            <Row style={{ margin: "4px 0" }} key={index + "positive"}>
              <Text
                size="small"
                type="green"
                onClick={() => {
                  const price = BN.parseUnits(o.price, vm.token1.decimals);
                  vm.setSellPrice(price, true);
                  vm.setBuyPrice(price, true);
                }}
              >
                {o.price.toFormat(2)}
              </Text>
              <Text size="small">{o.amount}</Text>
              <Text size="small">{o.total}</Text>
            </Row>
          ))
        )}
        <SizedBox height={8} />
        <Divider />
        <SizedBox height={8} />
        <Row>
          {!ordersStore.initialized ? (
            <>
              <Skeleton height={20} />
              <div />
              <Skeleton height={20} />
            </>
          ) : (
            <></>
          )}
        </Row>
        <SizedBox height={8} />
        <Divider />
        <SizedBox height={8} />
        {!ordersStore.initialized ? (
          <Skeleton height={20} style={{ marginBottom: 4 }} count={13} />
        ) : (
          orderFilter !== 1 &&
          sellOrders.map((o, index) => (
            <Row
              style={{ margin: "4px 0" }}
              key={index + "negative"}
              onClick={() => {
                const price = BN.parseUnits(o.reversePrice, vm.token1.decimals);
                vm.setSellPrice(price, true);
                vm.setBuyPrice(price, true);
              }}
            >
              <Text size="small" type="error">
                {o.reversePrice.toFormat(2)}
              </Text>
              <Text size="small">{o.totalLeft}</Text>
              <Text size="small">{o.amountLeft}</Text>
            </Row>
          ))
        )}
      </Container>
    </Root>
  );
};
export default observer(OrderBook);
