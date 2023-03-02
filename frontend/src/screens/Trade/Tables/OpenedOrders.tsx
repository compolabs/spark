import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import dayjs from "dayjs";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 16px;
`;
const OrderRow = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
`;
const OpenedOrders: React.FC<IProps> = () => {
  const columns = [
    "Date",
    "Pair",
    "Type",
    "Side",
    "Price",
    "Amount",
    "Status",
    "Total",
    "",
  ];

  return (
    <Root>
      <OrderRow>
        {columns.map((value) => (
          <Text size="small" key={value}>
            {value}
          </Text>
        ))}
      </OrderRow>
      <SizedBox height={8} />
      {Array.from({ length: 10 })
        .map(() => ({
          date: "",
          pair: "ETH/BTC",
          type: "limit",
          side: "sell",
          price: "10",
          amount: "status",
          total: "10 usdt",
          status: "0 %",
          action: "10 usdt",
        }))
        .map((v, index) => (
          <OrderRow key={index}>
            <Text> {dayjs().format("DD-MMM MM:HH")}</Text>
            <Text>{v.pair}</Text>
            <Text>{v.type}</Text>
            <Text>{v.side}</Text>
            <Text>{v.price}</Text>
            <Text>{v.amount}</Text>
            <Text>{v.status}</Text>
            <Text>{v.total}</Text>
            <Text
              style={{ cursor: "pointer" }}
              size="small"
              type="error"
              onClick={() => console.log("cancel")}
            >
              Cancel
            </Text>
          </OrderRow>
        ))}
    </Root>
  );
};
export default OpenedOrders;
