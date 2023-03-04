import styled from "@emotion/styled";
import { Column } from "@src/components/Flex";
import React from "react";
import Text from "@components/Text";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";

interface IProps {}

const Root = styled.div`
  display: flex;
  padding: 12px 16px;
  box-sizing: border-box;
  background: #222936;
  align-items: center;
  justify-content: space-between;
`;

const MobileStats: React.FC<IProps> = () => {
  const vm = useTradeVM();
  return (
    <Root>
      <Column>
        <Text>{`${vm.token0.symbol}/${vm.token1.symbol}`}</Text>
        <SizedBox height={8} />
        <Text size="big">0.71</Text>
        <SizedBox height={8} />
        <Text>$1,485.53</Text>
      </Column>
    </Root>
  );
};
export default observer(MobileStats);
