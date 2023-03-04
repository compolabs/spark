import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { Column } from "@components/Flex";
import Header from "@components/Header/Header";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "./constants";
import Trade from "@screens/Trade";
import Faucet from "@screens/Faucet";

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.mainBackground};
  min-height: 100vh;
`;
const MobileSpace = styled.div`
  height: 58px;
  @media (min-width: 880px) {
    display: none;
  }
`;
const App: React.FC = () => {
  return (
    <Root>
      <Header />
      <Routes>
        <Route path="*" element={<Trade />} />
        <Route path={ROUTES.FAUCET} element={<Faucet />} />
      </Routes>
      <MobileSpace />
    </Root>
  );
};

export default observer(App);
