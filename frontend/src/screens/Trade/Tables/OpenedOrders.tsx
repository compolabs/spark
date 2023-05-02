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
import BN from "@src/utils/BN";

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
    grid-template-columns: repeat(8, 1fr);
  }
`;

const OrderRow = styled(TableTitleRow)`
  padding: 6px 0;

  p {
    color: #fff;
  }

  .cancel-btn {
    color: #ff6a55;
  }
`;
const OpenedOrders: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  const { ordersStore } = useStores();
  const [openedModal, setModalOpened] = useState(false);
  const vm = useTradeVM();
  const [cancelOrderId, setCancelOrderId] = useState<null | string>(null);
  const userOrders = ordersStore.myOrders.filter((o) => o.status === "Active");
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
          <Img
            style={{ width: 100, height: 100 }}
            src={notFound}
            alt="no-data"
          />
          <SizedBox height={12} />
          <Text fitContent style={{ marginBottom: 24 }}>
            You have no open orders.
          </Text>
        </Column>
      ) : (
        userOrders.map((o) =>
          width && width >= 880 ? (
            <OrderRow key={o.id}>
              <Text size="small">{o.time}</Text>
              <Text size="small">{o.market}</Text>
              <Text size="small">{o.type}</Text>
              <Text size="small">
                {new BN(o.price).toFormat(2)} {o.market.split("/")[1]}
              </Text>
              <Text size="small">
                {o.amount} {o.token0.symbol}
                {/*{o.amount} {o.type === "BUY" ? o.token0.symbol : o.token1.symbol}*/}
              </Text>
              <Text size="small">{o.fullFillPercent} %</Text>
              <Text size="small">
                {o.total} {o.token1.symbol}
                {/*{o.total} {o.type === "BUY" ? o.token1.symbol : o.token0.symbol}*/}
              </Text>
              <Text
                style={{ cursor: "pointer" }}
                size="small"
                className="cancel-btn"
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
              key={o.id}
              time={o.time}
              pair={`${o.token0.symbol}/${o.token1.symbol}`}
              price={o.priceFormatter}
              amount={`${o.amount} ${o.token0.symbol}`}
              total={`${o.total} ${o.token1.symbol}`}
              fullFillPercent={o.fullFillPercent}
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
