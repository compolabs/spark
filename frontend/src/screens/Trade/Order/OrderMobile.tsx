import styled from "@emotion/styled";
import React, { useState } from "react";
import Button from "@components/Button";
import { observer } from "mobx-react-lite";
import OrderModal from "@screens/Trade/Order/OrderModal";

interface IProps {}

const Root = styled.div`
  display: flex;
  background: #292f3c;
  padding: 8px;
  position: fixed;
  width: 100%;
  bottom: 0;
  box-sizing: border-box;
`;

const OrderMobile: React.FC<IProps> = () => {
  const [openedDialog, setOpenedDialog] = useState(false);
  const [action, setAction] = useState<0 | 1>(0);
  return (
    <Root>
      <Button
        fixed
        onClick={() => {
          setOpenedDialog(true);
          setAction(0);
        }}
      >
        Place Order
      </Button>
      <OrderModal
        onClose={() => {
          setOpenedDialog(false);
          setAction(1);
        }}
        visible={openedDialog}
        initAction={action}
      />
    </Root>
  );
};
export default observer(OrderMobile);
