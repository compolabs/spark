import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import { observer } from "mobx-react-lite";
import sell from "@src/assets/icons/sellOrderBookIcon.svg";
import buy from "@src/assets/icons/buyOrderBookIcon.svg";
import sellAndSell from "@src/assets/icons/buyAndSellOrderBookIcon.svg";
import Divider from "@src/components/Divider";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { useTradeVM } from "@screens/Trade/TradeVm";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import Skeleton from "react-loading-skeleton";

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
const Row = styled.div`
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
const OrderBook: React.FC<IProps> = () => {
  const vm = useTradeVM();
  const { ordersStore } = useStores();
  const [orderFilter, setOrderFilter] = useState(0);
  const activeOrdersForCurrentPair = ordersStore.orders
    .filter((o) => o.status.Active != null)
    .filter(
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
    });
  const sellOrders = activeOrdersForCurrentPair
    .filter((o) => o.asset0 === vm.assetId1)
    .sort((a, b) => {
      if (a.reversePrice == null && b.reversePrice == null) return 0;
      if (a.reversePrice == null && b.reversePrice != null) return 1;
      if (a.reversePrice == null && b.reversePrice == null) return -1;
      return a.reversePrice!.lt(b.reversePrice!) ? -1 : 1;
    });
  const filters = [sell, buy, sellAndSell];
  const columns = [
    `Price ${vm.token1.symbol}`,
    `Amount ${vm.token0.symbol}`,
    `Total ${vm.token1.symbol}`,
  ];
  const currentPrice = "3.14";
  return (
    <Root>
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
      <SizedBox height={8} />
      <Divider />
      <Row>
        {columns.map((v) => (
          <Text size="small" key={v} type="secondary">
            {v}
          </Text>
        ))}
      </Row>
      <Divider />
      <SizedBox height={8} />
      <Container>
        {!ordersStore.initialized ? (
          <Skeleton height={20} style={{ marginBottom: 4 }} count={13} />
        ) : (
          orderFilter !== 1 &&
          buyOrders.map((o, index) => (
            <Row
              style={{ margin: "4px 0" }}
              key={index + "positive"}
              onClick={() => {
                const price = BN.parseUnits(o.price, vm.token1.decimals);
                vm.setSellPrice(price, true);
                vm.setBuyPrice(price, true);
              }}
            >
              <Text size="small" type="green">
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
            <>
              <Text>{currentPrice}</Text>
              <div />
              <Text>SPREAD 1.10%</Text>
            </>
          )}
        </Row>
        <SizedBox height={8} />
        <Divider />
        <SizedBox height={8} />
        {!ordersStore.initialized ? (
          <Skeleton height={20} style={{ marginBottom: 4 }} count={13} />
        ) : (
          orderFilter !== 2 &&
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
              <Text size="small">{o.total}</Text>
              <Text size="small">{o.amount}</Text>
            </Row>
          ))
        )}
      </Container>
    </Root>
  );
};
export default observer(OrderBook);
