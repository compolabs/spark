import styled from "@emotion/styled";
import Tabs from "@src/components/Tabs";
import React, { useState } from "react";
import SizedBox from "@components/SizedBox";
import OpenedOrders from "@screens/Trade/Tables/OpenedOrders";
import OrderHistory from "@screens/Trade/Tables/OrderHistory";
import Funds from "@screens/Trade/Tables/Funds";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import { Column } from "@src/components/Flex";
import Text from "@components/Text";
import Button from "@components/Button";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: tables;
  background: #222936;
  max-height: 230px;
`;
const TabsContainer = styled.div`
  padding: 12px 16px;
  display: flex;
  width: 100%;
  box-sizing: border-box;
`;
const DContainer = styled.div`
  display: flex;
  width: 100%;
  max-height: 166px;
  overflow-x: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;

  ::-webkit-scrollbar {
    display: none;
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const Tables: React.FC<IProps> = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { accountStore, settingsStore } = useStores();
  return (
    <Root>
      <TabsContainer>
        <Tabs
          tabs={[
            { name: "Opened orders" },
            { name: "Order history" },
            { name: "Funds" },
          ]}
          activeTab={activeTab}
          setActive={(t) => setActiveTab(t)}
        />
      </TabsContainer>
      <Container>
        {accountStore.isLoggedIn ? (
          <DContainer>
            {activeTab === 0 && <OpenedOrders />}
            {activeTab === 1 && <OrderHistory />}
            {activeTab === 2 && <Funds />}
          </DContainer>
        ) : (
          <Column alignItems="center" justifyContent="center">
            <Text>Connect wallet to trade</Text>
            <SizedBox height={8} />
            <Button onClick={() => settingsStore.setLoginModalOpened(true)}>
              Connect wallet
            </Button>
          </Column>
        )}
      </Container>
    </Root>
  );
};
export default observer(Tables);
