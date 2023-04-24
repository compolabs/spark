import styled from "@emotion/styled";
import React from "react";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";
import Text from "@src/components/Text";
import NoData from "@components/NoData";
import SizedBox from "@components/SizedBox";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Trades = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 210px;
  overflow-x: scroll;
  -ms-overflow-style: none;
`;

const TradeRecord = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

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
  const columns = [
    `Price (${vm.token1.symbol})`,
    `Amount (${vm.token0.symbol})`,
    "Time",
  ];
  return (
    <Root>
      {length === 0 ? (
        <>
          <TradeRecord>
            {columns.map((v, i) => (
              <Text
                textAlign={i === 1 ? "left" : i === 0 ? "left" : "right"}
                nowrap
                key={i}
                size="small"
                type="secondary"
              >
                {v}
              </Text>
            ))}
          </TradeRecord>
          <SizedBox height={12} />
          <Trades>
            {vm.trades.map((trade, i) => (
              <TradeRecord key={i}>
                <Text
                  textAlign="left"
                  size="small"
                  type={trade.asset0 === vm.assetId0 ? "green" : "error"}
                >
                  {trade.priceFormatter}
                </Text>
                <Text textAlign="left" size="small">
                  {trade.amountFormatter}
                </Text>
                <Text textAlign="right" size="small">
                  {trade.time}
                </Text>
              </TradeRecord>
            ))}
          </Trades>
        </>
      ) : (
        <NoData text="No data" />
      )}
    </Root>
  );
};
export default observer(MarketTrades);
