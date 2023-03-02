import styled from "@emotion/styled";
import React from "react";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import LoggedInAccountInfo from "@components/Wallet/LoggedInAccountInfo";
import LoginModal from "./LoginModal";
import Button from "@components/Button";

interface IProps {}

const Root = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Wallet: React.FC<IProps> = () => {
  const { accountStore, settingsStore } = useStores();
  return (
    <Root>
      {accountStore.address == null ? (
        <Button fixed onClick={() => settingsStore.setLoginModalOpened(true)}>
          Connect wallet
        </Button>
      ) : (
        <LoggedInAccountInfo />
      )}
      <LoginModal
        visible={settingsStore.loginModalOpened}
        onLogin={(loginType, phrase) => accountStore.login(loginType, phrase)}
        onClose={() => settingsStore.setLoginModalOpened(false)}
      />
    </Root>
  );
};
export default observer(Wallet);
