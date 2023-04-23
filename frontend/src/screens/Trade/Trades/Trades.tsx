import styled from "@emotion/styled";
import React, { useState } from "react";
import Tabs from "@components/Tabs";
import { Row } from "@components/Flex";
import Loading from "@components/Loading";
import { useStores } from "@stores";
import MarketTrades from "@screens/Trade/Trades/MarketTrades";
import AccountTrades from "@screens/Trade/Trades/AccountTrades";
import SizedBox from "@components/SizedBox";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: trades;
  background: #222936;
  padding: 12px 16px;
`;

const Trades: React.FC<IProps> = () => {
  const { tradesStore } = useStores();
  const [activeTab, setActiveTab] = useState(0);
  return (
    <Root>
      <Tabs
        tabs={[{ name: "Market Trades" }, { name: "My Trades" }]}
        activeTab={activeTab}
        setActive={(t) => setActiveTab(t)}
      />
      <SizedBox height={8} />
      {tradesStore.initialized ? (
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
export default Trades;
