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
  return (
    <Root>
      <Button fixed onClick={() => setOpenedDialog(true)}>
        Place Order
      </Button>
      <OrderModal
        onClose={() => setOpenedDialog(false)}
        visible={openedDialog}
      />
    </Root>
  );
};
export default observer(OrderMobile);
