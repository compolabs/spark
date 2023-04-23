import styled from "@emotion/styled";
import React from "react";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";
import Text from "@src/components/Text";
import NoData from "@components/NoData";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Data = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  width: 100%;

  p:last-of-type {
    text-align: end;
  }

  p:first-of-type {
    text-align: start;
  }
`;
const MarketTrades: React.FC<IProps> = () => {
  const length = 0;
  const vm = useTradeVM();
  const columns = [`Price (${vm.token1.symbol})`, `Amount (${vm.token0.symbol})`, "Time"];
  return (
    <Root>
      {length === 0 ? (
        <Data>
          {columns.map((v, i) => (
            <Text key={i} size="small" type="secondary">
              {v}
            </Text>
          ))}
        </Data>
      ) : (
        <NoData text="No data" />
      )}
    </Root>
  );
};
export default observer(MarketTrades);
