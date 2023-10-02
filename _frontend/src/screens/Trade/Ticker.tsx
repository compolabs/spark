import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import { useTradeVM } from "@screens/Trade/TradeVm";
import Text from "@components/Text";

interface IProps {}

const Root = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 12px;
  height: 64px;
  grid-area: ticker;
  width: 100%;
`;

const Ticker: React.FC<IProps> = () => {
  const vm = useTradeVM();
  return (
    <Root>
      <Text>
        {vm.token0.symbol}/{vm.token1.symbol}
      </Text>
    </Root>
  );
};
export default observer(Ticker);
