import styled from "@emotion/styled";
import React from "react";
import { useStores } from "@stores";
import { observer } from "mobx-react-lite";
import LoggedInAccountInfo from "@components/Wallet/LoggedInAccountInfo";
import LoginModal from "./LoginModal";
import Button from "@components/Button";
import { Row } from "@components/Flex";

interface IProps {}

const Root = styled(Row)`
  display: flex;
  //padding: 0 16px;
  justify-content: space-between;
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
        onLogin={(loginType, phrase) => accountStore.login(loginType)}
        onClose={() => settingsStore.setLoginModalOpened(false)}
      />
    </Root>
  );
};
export default observer(Wallet);
