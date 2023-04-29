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
import { TRADE_TYPE } from "@src/services/TradesService";

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
const filters = [sellAndBuy, sell, buy];
const DesktopOrderBook: React.FC<IProps> = () => {
  const vm = useTradeVM();
  const [round, setRound] = useState("2");
  const { ordersStore, accountStore, settingsStore } = useStores();
  const [orderFilter, setOrderFilter] = useState(0);

  const buyOrders = ordersStore.orderbook.buy
    .slice()
    .sort((a, b) => {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null && b.price != null) return 1;
      if (a.price == null && b.price == null) return -1;
      return a.price < b.price ? 1 : -1;
    })
    .reverse()
    .slice(orderFilter === 0 ? -15 : -40)
    .reverse();
  const sellOrders = ordersStore.orderbook.sell
    .slice()
    .sort((a, b) => {
      if (a.price == null && b.price == null) return 0;
      if (a.price == null && b.price != null) return 1;
      if (a.price == null && b.price == null) return -1;
      return a.price < b.price ? 1 : -1;
    })
    .slice(orderFilter === 0 ? -15 : -40);
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
        <Button onClick={() => settingsStore.setLoginModalOpened(true)}>Connect wallet</Button>
      </Root>
    );
  if (ordersStore.orderbook.buy.length === 0 && ordersStore.orderbook.sell.length === 0)
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
        <Container fitContent={orderFilter === 1 || orderFilter === 2} reverse={orderFilter === 1}>
          {!ordersStore.initialized ? (
            <Skeleton height={20} style={{ marginBottom: 4 }} count={15} />
          ) : (
            <>
              {orderFilter !== 2 &&
                sellOrders.map((o, index) => (
                  //Todo add hover
                  <Row
                    style={{ margin: "4px 0", cursor: "pointer" }}
                    key={index + "negative"}
                    onClick={() => {
                      const price = BN.parseUnits(o.price, vm.token1.decimals);

                      vm.setBuyPrice(price, true);
                      // vm.setSellAmpount(new BN(o.amount), true);
                      vm.setSellPrice(BN.ZERO, true);
                      vm.setSellAmount(BN.ZERO, true);
                      vm.setSellTotal(BN.ZERO, true);
                    }}
                  >
                    <Text size="small" type="error">
                      {new BN(o.price).toFormat(+round)}
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
              {orderFilter === 0 &&
                Array.from({
                  length: sellOrders.length < 15 ? 14 - sellOrders.length : 0,
                }).map((o, index) => (
                  <Row style={{ margin: "4px 0" }} key={index + "positive-plug"}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Text
                        key={index + "positive-plug" + i}
                        textAlign={i === 0 ? undefined : i === 1 ? "center" : "right"}
                        size="small"
                      >
                        -
                      </Text>
                    ))}
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
                <Text
                  type={vm.latestTrade?.type === TRADE_TYPE.SELL ? "error" : "green"}
                  weight={700}
                  style={{ fontSize: 13 }}
                  size="small"
                >
                  {vm.latestTrade?.priceFormatter}
                </Text>
                {/*todo add spread calc*/}
                {/*<Text*/}
                {/*  textAlign="right"*/}
                {/*  type="secondary"*/}
                {/*  size="small"*/}
                {/*>{`SPREAD ${spread} %`}</Text>*/}
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
            <Skeleton height={20} style={{ marginBottom: 4 }} count={15} />
          ) : (
            <>
              {orderFilter === 0 &&
                Array.from({
                  length: buyOrders.length < 15 ? 14 - buyOrders.length : 0,
                }).map((o, index) => (
                  <Row style={{ margin: "4px 0" }} key={index + "negative-plug"}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Text
                        key={index + "negative-plug" + i}
                        size="small"
                        textAlign={i === 0 ? undefined : i === 1 ? "center" : "right"}
                      >
                        -
                      </Text>
                    ))}
                  </Row>
                ))}
              {orderFilter !== 1 &&
                buyOrders.map((o, index) => (
                  //Todo add hover
                  <Row style={{ margin: "4px 0", cursor: "pointer" }} key={index + "positive"}>
                    <Text
                      size="small"
                      type="green"
                      onClick={() => {
                        const price = BN.parseUnits(o.price, vm.token1.decimals);
                        vm.setSellPrice(price, true);
                        // vm.setBuyAmount(new BN(o.amount), true);
                        vm.setBuyPrice(BN.ZERO, true);
                        vm.setBuyAmount(BN.ZERO, true);
                        vm.setBuyTotal(BN.ZERO, true);
                      }}
                    >
                      {new BN(o.price).toFormat(+round)}
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
            </>
          )}
        </Container>
      </Root>
    );
};
export default observer(DesktopOrderBook);
