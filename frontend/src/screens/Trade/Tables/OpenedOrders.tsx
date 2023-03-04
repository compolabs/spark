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
import { Column } from "@src/components/Flex";
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
    grid-template-columns: repeat(9, 1fr);
  }
`;
const OpenedOrders: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  const { ordersStore } = useStores();

  const vm = useTradeVM();
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
            You have no open orders.
            <SizedBox height={24} />
          </Text>
        </Column>
      ) : (
        ordersStore.orders
          .filter((o) => o.status.Active != null)
          .map((o) => ({
            date: "",
            pair: `${o.symbol0}/${o.symbol1}`,
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
                <Text
                  style={{ cursor: "pointer" }}
                  size="small"
                  type="error"
                  onClick={() => console.log("cancel")}
                >
                  Cancel
                </Text>
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
export default observer(OpenedOrders);
