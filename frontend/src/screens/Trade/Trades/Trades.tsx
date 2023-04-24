import styled from "@emotion/styled";
import React, { useState } from "react";
import Tabs from "@components/Tabs";
import { Row } from "@components/Flex";
import Loading from "@components/Loading";
import MarketTrades from "@screens/Trade/Trades/MarketTrades";
import AccountTrades from "@screens/Trade/Trades/AccountTrades";
import SizedBox from "@components/SizedBox";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: trades;
  background: #222936;
  padding: 12px 16px;
`;

//todo change logic to get both trades with visa verse tokens too
const Trades: React.FC<IProps> = () => {
  const vm = useTradeVM();
  const [activeTab, setActiveTab] = useState(0);
  return (
    <Root>
      <Tabs
        // tabs={[{ name: "Market Trades" }]}
        tabs={[{ name: "Market Trades" }, { name: "My Trades" }]}
        activeTab={activeTab}
        setActive={(t) => setActiveTab(t)}
      />
      <SizedBox height={8} />
      {vm.trades.length > 0 ? (
        <>
          {activeTab === 0 && <MarketTrades />}
          {activeTab === 1 && <AccountTrades />}
        </>
      ) : (
        <Row justifyContent="center">
          <Loading />
        </Row>
      )}
    </Root>
  );
};
export default observer(Trades);
