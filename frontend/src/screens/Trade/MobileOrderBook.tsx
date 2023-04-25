import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import { observer } from "mobx-react-lite";
import sell from "@src/assets/icons/sellOrderBookIcon.svg";
import buy from "@src/assets/icons/buyOrderBookIcon.svg";
import sellAndBuy from "@src/assets/icons/buyAndSellOrderBookIcon.svg";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { useTradeVM } from "@screens/Trade/TradeVm";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import Skeleton from "react-loading-skeleton";
import Button from "@components/Button";
import { Column, Row } from "@src/components/Flex";
import Select from "@src/components/Select";
import NoData from "@components/NoData";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  background: #222936;
  grid-area: orderbook;
  padding: 8px 12px;
  min-width: 400px;
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
const Container = styled.div<{ oneTab?: boolean }>`
  display: grid;
  ${({ oneTab }) =>
    oneTab ? "grid-template-columns: 1fr " : "grid-template-columns: 1fr 1fr"};
  column-gap: 8px;
`;
const roundOptions = [2, 4, 5, 6].map((v) => ({
  title: `${v} decimals`,
  key: v.toString(),
}));
const OrderRow = styled.div<{ noHover?: boolean }>`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, 1fr);
  ${({ noHover }) => !noHover && "cursor: pointer;"};

  text-align: center;

  p:last-of-type {
    text-align: end;
  }

  p:first-of-type {
    text-align: start;
  }

  :hover {
    ${({ noHover }) => !noHover && "background:  #323846;"};
  }
`;

/*Todo починить*/
const filters = [sellAndBuy, sell, buy];
const MobileOrderBook: React.FC<IProps> = () => {
  const vm = useTradeVM();
  const [round, setRound] = useState("2");
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
    .slice(-13);

  const sellOrders = activeOrdersForCurrentPair
    .filter((o) => o.asset0 === vm.assetId1)
    .sort((a, b) => {
      if (a.reversePrice == null && b.reversePrice == null) return 0;
      if (a.reversePrice == null && b.reversePrice != null) return 1;
      if (a.reversePrice == null && b.reversePrice == null) return -1;
      return a.reversePrice!.lt(b.reversePrice!) ? -1 : 1;
    })
    .slice(-13)
    .reverse();

  const columns = [`Amount ${vm.token0.symbol}`, `Price ${vm.token1.symbol}`];

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
  if (activeOrdersForCurrentPair.length === 0)
    return (
      <Root>
        <NoData text="No trades for this pair" />
      </Root>
    );
  return (
    <Root>
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
      <Container oneTab={orderFilter !== 0}>
        <Column crossAxisSize="max">
          {orderFilter !== 2 && (
            <OrderRow noHover>
              {columns.map((v) => (
                <Text size="small" key={v} type="secondary">
                  {v}
                </Text>
              ))}
            </OrderRow>
          )}
          <SizedBox height={12} />
          {!ordersStore.initialized ? (
            <Skeleton height={20} style={{ marginBottom: 4 }} count={13} />
          ) : (
            <>
              {orderFilter !== 2 &&
                buyOrders.map((o, index) => (
                  <Row style={{ margin: "4px 0" }} key={index + "positive"}>
                    <Text textAlign="left" size="small">
                      {o.amount}
                    </Text>
                    <Text
                      size="small"
                      type="error"
                      onClick={() => {
                        const price = BN.parseUnits(
                          o.price,
                          vm.token1.decimals
                        );
                        vm.setSellPrice(price, true);
                        vm.setBuyPrice(price, true);
                      }}
                      textAlign="right"
                    >
                      {o.price.toFormat(+round)}
                    </Text>
                  </Row>
                ))}
              {orderFilter === 0 &&
                Array.from({
                  length: buyOrders.length < 13 ? 13 - buyOrders.length : 0,
                }).map((o, index) => (
                  <Row
                    style={{ margin: "4px 0" }}
                    key={index + "negative-plug"}
                  >
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Text size="small" textAlign={i === 0 ? "left" : "right"}>
                        -
                      </Text>
                    ))}
                  </Row>
                ))}
            </>
          )}
        </Column>
        <Column crossAxisSize="max">
          {orderFilter !== 1 && (
            <OrderRow noHover>
              {columns.reverse().map((v) => (
                <Text size="small" key={v} type="secondary">
                  {v}
                </Text>
              ))}
            </OrderRow>
          )}
          <SizedBox height={12} />
          {!ordersStore.initialized ? (
            <Skeleton height={20} style={{ marginBottom: 4 }} count={13} />
          ) : (
            <>
              {orderFilter !== 1 &&
                sellOrders.map((o, index) => (
                  <Row
                    style={{ margin: "4px 0" }}
                    key={index + "negative"}
                    onClick={() => {
                      const price = BN.parseUnits(
                        o.reversePrice,
                        vm.token1.decimals
                      );
                      vm.setSellPrice(price, true);
                      vm.setBuyPrice(price, true);
                    }}
                  >
                    <Text textAlign="left" size="small" type="green">
                      {o.reversePrice.toFormat(+round)}
                    </Text>
                    <Text textAlign="right" size="small">
                      {o.amountLeft}
                    </Text>
                  </Row>
                ))}
              {orderFilter === 0 &&
                Array.from({
                  length: sellOrders.length < 13 ? 13 - sellOrders.length : 0,
                }).map((o, index) => (
                  <Row
                    style={{ margin: "4px 0" }}
                    key={index + "negative-plug"}
                  >
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Text textAlign={i === 0 ? "left" : "right"} size="small">
                        -
                      </Text>
                    ))}
                  </Row>
                ))}
            </>
          )}
        </Column>
      </Container>
    </Root>
  );
};
export default observer(MobileOrderBook);
