import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import dayjs from "dayjs";
import useWindowSize from "@src/hooks/useWindowSize";
import OrderItem from "@screens/Trade/Tables/OrderItem";
import BN from "@src/utils/BN";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";
import { Column } from "@components/Flex";
import Img from "@components/Img";
import notFound from "@src/assets/notFound.svg";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 16px;
`;
const OrderRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  @media (min-width: 880px) {
    height: 36px;
    grid-template-columns: repeat(8, 1fr);
  }
`;
const OrderHistory: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  const { ordersStore, accountStore } = useStores();
  const columns = [
    "Date",
    "Pair",
    "Type",
    "Side",
    "Price",
    "Amount",
    "Status",
    "Total",
  ];

  return (
    <Root>
      {width && width >= 880 && ordersStore.orders.length > 0 && (
        <OrderRow>
          {columns.map((value) => (
            <Text size="small" key={value}>
              {value}
            </Text>
          ))}
        </OrderRow>
      )}
      <SizedBox height={8} />
      {ordersStore.orders.length === 0 ? (
        <Column justifyContent="center" alignItems="center" crossAxisSize="max">
          <Img
            style={{ width: 100, height: 100 }}
            src={notFound}
            alt="no-data"
          />
          <SizedBox height={12} />
          <Text fitContent>
            You have no order history.
            <SizedBox height={24} />
          </Text>
        </Column>
      ) : (
        ordersStore.orders
          .filter((o) => o.status.Active == null)
          .filter((o) => o.owner === accountStore.ethFormatWallet)
          .map((o, index) =>
            width && width >= 880 ? (
              <OrderRow key={index}>
                <Text> {o.time}</Text>
                <Text>{`${o.token0.symbol}/${o.token1.symbol}`}</Text>
                <Text>limit</Text>
                <Text>{o.price}</Text>
                <Text>{o.amount}</Text>
                <Text>{o.fullFillPercent} %</Text>
                <Text>{o.statusString}</Text>
                <Text>{o.total}</Text>
              </OrderRow>
            ) : (
              <OrderItem
                id={"1"}
                time={o.time}
                pair={`${o.token0.symbol}/${o.token1.symbol}`}
                price={o.price}
                amount={o.amount}
                fullFillPercent={o.fullFillPercent}
                total={o.total}
                status={o.statusString}
              />
            )
          )
      )}
    </Root>
  );
};
export default observer(OrderHistory);
