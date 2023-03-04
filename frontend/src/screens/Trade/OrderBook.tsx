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
  width: 100%;
`;
const OrderBook: React.FC<IProps> = () => {
  const vm = useTradeVM();
  const [orderFilter, setOrderFilter] = useState(0);
  const data = Array.from({ length: orderFilter === 0 ? 13 : 28 }).map(() => ({
    priceToken1: "0.07873807",
    amountToken0: "0.07873807",
    totalToken1: "0.06117154",
  }));

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
            onClick={() => setOrderFilter(index)}
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
        {orderFilter !== 1 &&
          data.map(({ priceToken1, amountToken0, totalToken1 }, index) => (
            <Row
              style={{ margin: "4px 0" }}
              key={index + "positive"}
              onClick={() => vm.setBuyPrice(new BN(priceToken1), true)}
            >
              <Text size="small" type="error">
                {priceToken1}
              </Text>
              <Text size="small">{amountToken0}</Text>
              <Text size="small">{totalToken1}</Text>
            </Row>
          ))}
        <SizedBox height={8} />
        <Divider />
        <SizedBox height={8} />
        <Row>
          <Text>{currentPrice}</Text>
          <div />
          <Text>SPREAD 1.10%</Text>
        </Row>
        <SizedBox height={8} />
        <Divider />
        <SizedBox height={8} />
        {orderFilter !== 2 &&
          data.map(({ priceToken1, amountToken0, totalToken1 }, index) => (
            <Row
              style={{ margin: "4px 0" }}
              key={index + "negative"}
              onClick={() => vm.setSellPrice(new BN(priceToken1), true)}
            >
              <Text size="small" type="green">
                {priceToken1}
              </Text>
              <Text size="small">{amountToken0}</Text>
              <Text size="small">{totalToken1}</Text>
            </Row>
          ))}
      </Container>
    </Root>
  );
};
export default observer(OrderBook);
