import styled from "@emotion/styled";
import React, { useState } from "react";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import useWindowSize from "@src/hooks/useWindowSize";
import OrderItem from "@screens/Trade/Tables/OrderItem";
import { observer } from "mobx-react-lite";
import { Column } from "@src/components/Flex";
import Img from "@components/Img";
import notFound from "@src/assets/notFound.svg";
import { useStores } from "@stores";
import Dialog from "@components/Dialog";
import Button from "@components/Button";
import { useTradeVM } from "@screens/Trade/TradeVm";

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
const OpenedOrders: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  const { ordersStore, accountStore } = useStores();
  const [openedModal, setModalOpened] = useState(false);
  const vm = useTradeVM();
  const [cancelOrderId, setCancelOrderId] = useState<null | string>(null);
  const columns = [
    "Date",
    "Pair",
    "Type",
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
                <Text>{o.total}</Text>
                <Text
                  style={{ cursor: "pointer" }}
                  size="small"
                  type="error"
                  onClick={() => {
                    setModalOpened(true);
                    setCancelOrderId(o.id);
                  }}
                >
                  Cancel
                </Text>
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
                status="Active"
                onCancel={() => {
                  setModalOpened(true);
                  setCancelOrderId(o.id);
                }}
              />
            )
          )
      )}

      <Dialog
        style={{ maxWidth: 360 }}
        title="Cancel order"
        visible={openedModal}
        onClose={() => setModalOpened(false)}
      >
        <Column crossAxisSize="max" alignItems="center" justifyContent="center">
          <Text size="medium" weight={500} fitContent textAlign="center">
            Are you sure you want cancel the order?
          </Text>
          <SizedBox height={24} />
          <Button
            fixed
            kind="danger"
            onClick={() => {
              setModalOpened(false);
              cancelOrderId && vm.cancelOrder(cancelOrderId);
            }}
          >
            Cancel the order
          </Button>
          <SizedBox height={8} />
          <Button
            fixed
            onClick={() => {
              setModalOpened(false);
              setCancelOrderId(null);
            }}
          >
            Go back
          </Button>
          <SizedBox height={24} />
        </Column>
      </Dialog>
    </Root>
  );
};
export default observer(OpenedOrders);
