import React, { useState } from "react";
import Dialog from "@components/Dialog";
import { LOGIN_TYPE } from "@stores/AccountStore";
import LoginType from "./LoginType";
import { observer } from "mobx-react-lite";
import styled from "@emotion/styled";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "../Flex";
import Button from "@components/Button";
import TextArea from "@components/TextArea";
import Img from "../Img";
import Text from "../Text";
import logo from "@src/assets/icons/dark-logo.svg";

interface IProps {
  onClose: () => void;
  onLogin: (loginType: LOGIN_TYPE, mn?: string) => void;
  visible: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const LoginModal: React.FC<IProps> = ({ onLogin, ...rest }) => {
  const [isImportInputOpened, setImportInputOpened] = useState(false);
  const [err, setErr] = useState(false);
  const [seed, setSeed] = useState("");
  const handleLogin = (type: LOGIN_TYPE) => () => {
    onLogin(type);
    rest.onClose();
  };

  const handlePastInput = async () => {
    const value = await navigator.clipboard.readText();
    setSeed(value);
    setErr(false);
  };
  const handleLoginWithSeed = () => {
    // const valid = isValidMnemonic(seed);
    // if (!valid) {
    //   setErr(true);
    //   return;
    // }
    onLogin(LOGIN_TYPE.PRIVATE_KEY, seed);
    setImportInputOpened(false);
    setSeed("");
    setErr(false);
    rest.onClose();
  };

  const loginTypes = [
    {
      title: "Fuelet",
      isActive: window.fuelet != null,
      onClick: handleLogin(LOGIN_TYPE.FUELET),
    },
    {
      title: "Fuel wallet",
      type: LOGIN_TYPE.FUEL_WALLET,
      isActive: window.fuel != null,
      onClick: handleLogin(LOGIN_TYPE.FUEL_WALLET),
    },
    // {
    //   title: "Paste private key",
    //   type: LOGIN_TYPE.PRIVATE_KEY,
    //   isActive: true,
    //   onClick: () => setImportInputOpened(true),
    // },
  ];
  return (
    <Dialog style={{ maxWidth: 360 }} {...rest}>
      <Root>
        <Img height="60" width="60" src={logo} />
        <SizedBox height={4} />
        <Text fitContent size="medium">
          Connect wallet
        </Text>
        <SizedBox height={4} />
        <Text fitContent type="secondary" weight={500} size="tiny">
          To start using Spark
        </Text>
        <SizedBox height={34} />
        {window.fuel == null && window.fuelet == null && (
          <Column justifyContent="center" alignItems="center">
            <Text>No wallet was detected</Text>
            <SizedBox height={8} />
            <Button
              onClick={() =>
                window.open("https://wallet.fuel.network/docs/install/")
              }
            >
              Go to wallet
            </Button>
          </Column>
        )}
        {!isImportInputOpened ? (
          loginTypes.map(
            (t, i) =>
              t.isActive && <LoginType {...t} key={i} onClick={t.onClick} />
          )
        ) : (
          <Column crossAxisSize="max">
            <TextArea
              value={seed}
              error={err}
              onChange={(e) => {
                setSeed(e);
                setErr(false);
              }}
            />
            <SizedBox height={10} />
            <Row>
              <Button fixed onClick={handlePastInput}>
                Paste from buffer
              </Button>
              <SizedBox width={10} />
              <Button onClick={handleLoginWithSeed} fixed>
                Connect wallet
              </Button>
            </Row>
          </Column>
        )}
        <SizedBox height={36} />
      </Root>
    </Dialog>
  );
};
export default observer(LoginModal);
