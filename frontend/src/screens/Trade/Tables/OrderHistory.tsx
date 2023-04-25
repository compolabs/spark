import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import useWindowSize from "@src/hooks/useWindowSize";
import OrderItem from "@screens/Trade/Tables/OrderItem";
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

const TableTitleRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 8px 0;
  p {
    color: #959dae;
  }
  @media (min-width: 880px) {
    height: 36px;
    grid-template-columns: repeat(7, 1fr);
  }
`;

const OrderRow = styled(TableTitleRow)`
  padding: 6px 0;
  p {
    color: #fff;
  }
`;

const OrderHistory: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  const { ordersStore } = useStores();

  const userOrders = ordersStore.myOrders.filter((o) => o.status !== "Active");

  const columns = ["Date", "Pair", "Type", "Price", "Amount", "Status", "Total"];

  return (
    <Root>
      {width && width >= 880 && userOrders.length > 0 && (
        <TableTitleRow>
          {columns.map((value) => (
            <Text size="small" key={value}>
              {value}
            </Text>
          ))}
        </TableTitleRow>
      )}
      {userOrders.length === 0 ? (
        <Column justifyContent="center" alignItems="center" crossAxisSize="max">
          <SizedBox height={16} />
          <Img style={{ width: 100, height: 100 }} src={notFound} alt="no-data" />
          <SizedBox height={12} />
          <Text fitContent style={{ marginBottom: 24 }}>
            You have no order history.
          </Text>
        </Column>
      ) : (
        userOrders.map((o) =>
          width && width >= 880 ? (
            <OrderRow key={o.id}>
              <Text size="small"> {o.time}</Text>
              <Text size="small">{`${o.token0.symbol}/${o.token1.symbol}`}</Text>
              <Text size="small">limit</Text>
              <Text size="small">{o.priceFormatter}</Text>
              <Text size="small">
                {o.amount} {o.token0.symbol}
              </Text>
              <Text size="small">{o.fullFillPercent !== 100 ? "Canceled" : "Completed"}</Text>
              <Text size="small">
                {o.total} {o.token1.symbol}
              </Text>
            </OrderRow>
          ) : (
            <OrderItem
              key={o.id}
              time={o.time}
              pair={`${o.token0.symbol}/${o.token1.symbol}`}
              price={o.priceFormatter}
              fullFillPercent={o.fullFillPercent}
              status={o.fullFillPercent !== 100 ? "Canceled" : "Completed"}
              amount={`${o.amount} ${o.token0.symbol}`}
              total={`${o.total} ${o.token1.symbol}`}
            />
          )
        )
      )}
    </Root>
  );
};
export default observer(OrderHistory);
