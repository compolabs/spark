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
import { Row } from "@src/components/Flex";
import Select from "@src/components/Select";
import NoData from "@components/NoData";

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
const OrderRow = styled.div<{ noHover?: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
const Container = styled.div<{ fitContent?: boolean; reverse?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  ${({ fitContent }) => !fitContent && "height: 100%;"};
  ${({ reverse }) => reverse && "flex-direction: column-reverse;"};
`;
const roundOptions = [2, 4, 5, 6].map((v) => ({
  title: `${v} decimals`,
  key: v.toString(),
}));
const DesktopOrderBook: React.FC<IProps> = () => {
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
    .slice(orderFilter === 0 ? -13 : -25);

  const sellOrders = activeOrdersForCurrentPair
    .filter((o) => o.asset0 === vm.assetId1)
    .sort((a, b) => {
      if (a.reversePrice == null && b.reversePrice == null) return 0;
      if (a.reversePrice == null && b.reversePrice != null) return 1;
      if (a.reversePrice == null && b.reversePrice == null) return -1;
      return a.reversePrice!.lt(b.reversePrice!) ? -1 : 1;
    })
    .slice(orderFilter === 0 ? -13 : -25)
    .reverse();

  const filters = [sellAndBuy, buy, sell];
  const columns = [
    `Price ${vm.token1.symbol}`,
    `Amount ${vm.token0.symbol}`,
    `Total ${vm.token1.symbol}`,
  ];

  const spread = 3.5;
  const currentPrice = new BN(20000).toFormat();
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
      <Root
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NoData text="No orders for this pair" />
      </Root>
    );
  else
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
        <Divider />
        <OrderRow noHover>
          {columns.map((v) => (
            <Text size="small" key={v} type="secondary">
              {v}
            </Text>
          ))}
        </OrderRow>
        <Divider />
        <SizedBox height={8} />
        <Container
          fitContent={orderFilter === 1 || orderFilter === 2}
          reverse={orderFilter === 1}
        >
          {!ordersStore.initialized ? (
            <Skeleton height={20} style={{ marginBottom: 4 }} count={13} />
          ) : (
            <>
              {orderFilter === 0 &&
                Array.from({
                  length: buyOrders.length < 12 ? 13 - buyOrders.length : 0,
                }).map((o, index) => (
                  <Row
                    style={{ margin: "4px 0" }}
                    key={index + "negative-plug"}
                  >
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Text
                        key={index + "negative-plug" + i}
                        size="small"
                        textAlign={
                          i === 0 ? undefined : i === 1 ? "center" : "right"
                        }
                      >
                        -
                      </Text>
                    ))}
                  </Row>
                ))}
              {orderFilter !== 2 &&
                buyOrders.map((o, index) => (
                  //Todo add hover
                  <Row
                    style={{ margin: "4px 0", cursor: "pointer" }}
                    key={index + "positive"}
                  >
                    <Text
                      size="small"
                      type="error"
                      onClick={() => {
                        const price = BN.parseUnits(
                          o.price,
                          vm.token1.decimals
                        );
                        vm.setBuyPrice(price, true);
                        // vm.setBuyAmount(new BN(o.amount), true);
                        vm.setSellPrice(BN.ZERO, true);
                        vm.setSellAmount(BN.ZERO, true);
                        vm.setSellTotal(BN.ZERO, true);
                      }}
                    >
                      {o.price.toFormat(+round)}
                    </Text>
                    <Text textAlign="center" size="small">
                      {/*Todo добавить плоосу закрытия*/}
                      {o.amountLeft}
                    </Text>
                    <Text textAlign="right" size="small">
                      {o.totalLeft}
                    </Text>
                  </Row>
                ))}
            </>
          )}
          {orderFilter === 0 && (
            <>
              <SizedBox height={8} />
              <Divider />
              <SizedBox height={8} />
            </>
          )}
          <Row>
            {!ordersStore.initialized ? (
              <>
                <Skeleton height={20} />
                <div />
                <Skeleton height={20} />
              </>
            ) : (
              <Row>
                <Text weight={500} size="small">
                  {currentPrice}
                </Text>
                <Text
                  textAlign="right"
                  type="secondary"
                  size="small"
                >{`SPREAD ${spread} %`}</Text>
              </Row>
            )}
          </Row>
          {orderFilter === 0 && (
            <>
              <SizedBox height={8} />
              <Divider />
              <SizedBox height={8} />
            </>
          )}
          {!ordersStore.initialized ? (
            <Skeleton height={20} style={{ marginBottom: 4 }} count={13} />
          ) : (
            <>
              {orderFilter !== 1 &&
                sellOrders.map((o, index) => (
                  //Todo add hover
                  <Row
                    style={{ margin: "4px 0", cursor: "pointer" }}
                    key={index + "negative"}
                    onClick={() => {
                      const price = BN.parseUnits(
                        o.reversePrice,
                        vm.token1.decimals
                      );
                      vm.setSellPrice(price, true);
                      // vm.setSellAmount(new BN(o.amount), true);
                      vm.setBuyPrice(BN.ZERO, true);
                      vm.setBuyAmount(BN.ZERO, true);
                      vm.setBuyTotal(BN.ZERO, true);
                    }}
                  >
                    <Text size="small" type="green">
                      {o.reversePrice.toFormat(+round)}
                    </Text>
                    <Text textAlign="center" size="small">
                      {/*Todo добавить плоосу закрытия*/}
                      {o.totalLeft}
                    </Text>
                    <Text textAlign="right" size="small">
                      {o.amountLeft}
                    </Text>
                  </Row>
                ))}
              {orderFilter === 0 &&
                Array.from({
                  length: sellOrders.length < 12 ? 13 - sellOrders.length : 0,
                }).map((o, index) => (
                  <Row
                    style={{ margin: "4px 0" }}
                    key={index + "positive-plug"}
                  >
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Text
                        key={index + "positive-plug" + i}
                        textAlign={
                          i === 0 ? undefined : i === 1 ? "center" : "right"
                        }
                        size="small"
                      >
                        -
                      </Text>
                    ))}
                  </Row>
                ))}
            </>
          )}
        </Container>
      </Root>
    );
};
export default observer(DesktopOrderBook);