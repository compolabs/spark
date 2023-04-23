import styled from "@emotion/styled";
import React, { useState } from "react";
import Tabs from "@components/Tabs";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: trades;
  background: #222936;
  padding: 12px 16px;
`;

const Trades: React.FC<IProps> = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <Root>
      <Tabs
        tabs={[{ name: "Market Trades" }, { name: "My Trades" }]}
        activeTab={activeTab}
        setActive={(t) => setActiveTab(t)}
      />
    </Root>
  );
};
export default Trades;
