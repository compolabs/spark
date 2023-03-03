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
    grid-template-columns: repeat(9, 1fr);
  }
`;
const OrderHistory: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  const vm = useTradeVM();
  const length = 0;
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
      {width && width >= 880 && length > 0 && (
        <OrderRow>
          {columns.map((value) => (
            <Text size="small" key={value}>
              {value}
            </Text>
          ))}
        </OrderRow>
      )}
      <SizedBox height={8} />
      {length === 0 ? (
        <Text>No data yet</Text>
      ) : (
        Array.from({ length })
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
          .map((v, index) =>
            width && width >= 880 ? (
              <OrderRow key={index}>
                <Text> {dayjs().format("DD-MMM MM:HH")}</Text>
                <Text>{v.pair}</Text>
                <Text>{v.type}</Text>
                <Text>{v.side}</Text>
                <Text>{v.price}</Text>
                <Text>{v.amount}</Text>
                <Text>{v.status}</Text>
                <Text>{v.total}</Text>
              </OrderRow>
            ) : (
              <OrderItem
                id={"1"}
                amount0={BN.ZERO}
                token0={vm.assetId0}
                amount1={BN.ZERO}
                token1={vm.assetId1}
                txId={""}
                fulfilled0={BN.ZERO}
                fulfilled1={BN.ZERO}
                timestamp={0}
                status="active"
                onCancel={() => console.log("cancel order")}
              />
            )
          )
      )}
    </Root>
  );
};
export default observer(OrderHistory);
