import styled from "@emotion/styled";
import React from "react";
import Button from "@components/Button";
import SizedBox from "@components/SizedBox";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";

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
  const vm = useTradeVM();
  return (
    <Root>
      <Button fixed kind="green">
        Buy {vm.token0.symbol}
      </Button>
      <SizedBox width={8} />
      <Button fixed kind="danger">
        Sell {vm.token1.symbol}
      </Button>
    </Root>
  );
};
export default observer(OrderMobile);
