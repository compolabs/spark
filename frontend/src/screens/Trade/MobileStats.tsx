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
  //flex-direction: column;
  padding: 12px 16px;
  box-sizing: border-box;
  background: #222936;
  align-items: center;
  justify-content: space-between;
`;
const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 16px;
  grid-row-gap: 8px;
`;

const MobileStats: React.FC<IProps> = () => {
  const vm = useTradeVM();
  const stats = [
    { title: "24h High", value: "0.071" },
    { title: "24h Low", value: "0.07099999" },
    { title: `24h Volume ${vm.token0.symbol}`, value: "0.13694160" },
    { title: `24h Volume ${vm.token1.symbol}`, value: "0.00972285" },
  ];
  return (
    <Root>
      <Column>
        <Text>{`${vm.token0.symbol}/${vm.token1.symbol}`}</Text>
        <SizedBox height={8} />
        <Text size="big">0.71</Text>
        <SizedBox height={8} />
        <Text>$1,485.53</Text>
      </Column>
      <Stats>
        {stats.map(({ title, value }) => (
          <Column>
            <Text size="tiny" type="secondary">
              {title}
            </Text>
            <SizedBox height={4} />
            <Text size="small" weight={500}>
              {value}
            </Text>
          </Column>
        ))}
      </Stats>
    </Root>
  );
};
export default observer(MobileStats);
