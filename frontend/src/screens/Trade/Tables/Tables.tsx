import styled from "@emotion/styled";
import Tabs from "@src/components/Tabs";
import React, { useState } from "react";
import OpenedOrders from "@screens/Trade/Tables/OpenedOrders";
import OrderHistory from "@screens/Trade/Tables/OrderHistory";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import { Row } from "@src/components/Flex";
import Text from "@components/Text";
import Loading from "@components/Loading";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: tables;
  background: #222936;
  max-height: 230px;
`;
const TabsContainer = styled.div`
  padding: 12px 16px 0 12px;
  display: flex;
  width: 100%;
  box-sizing: border-box;
`;
const DContainer = styled.div`
  display: flex;
  width: 100%;
  max-height: 184px;
  overflow-x: scroll;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
`;
const Block = styled(Row)`
  padding: 32px 0;
`;
const ConnectBtn = styled(Text)`
  cursor: pointer;
  padding: 32px 0;
  color: #3c69ff;
`;

const Tables: React.FC<IProps> = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { accountStore, ordersStore, settingsStore } = useStores();
  return (
    <Root>
      <TabsContainer>
        <Tabs
          tabs={[{ name: "Opened orders" }, { name: "Order history" }]}
          activeTab={activeTab}
          setActive={(t) => setActiveTab(t)}
        />
      </TabsContainer>
      <Container>
        <DContainer>
          {accountStore.isLoggedIn ? (
            ordersStore.initialized ? (
              <>
                {activeTab === 0 && <OpenedOrders />}
                {activeTab === 1 && <OrderHistory />}
              </>
            ) : (
              <Row justifyContent="center">
                <Loading />
              </Row>
            )
          ) : (
            <Block>
              <ConnectBtn
                textAlign="center"
                onClick={() => settingsStore.setLoginModalOpened(true)}
              >
                Connect wallet to trade
              </ConnectBtn>
            </Block>
          )}
        </DContainer>
      </Container>
    </Root>
  );
};
export default observer(Tables);
