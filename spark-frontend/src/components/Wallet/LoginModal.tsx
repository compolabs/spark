import React from "react";
import Dialog from "@components/Dialog";
import {LOGIN_TYPE} from "@stores/AccountStore";
import {observer} from "mobx-react-lite";
import styled from "@emotion/styled";
import SizedBox from "../SizedBox";
import Text from "../Text";
import LoginType from "./LoginType";

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
const LoginModal: React.FC<IProps> = ({onLogin, ...rest}) => {
    const handleLogin = (type: LOGIN_TYPE) => () => {
        onLogin(type);
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
            onClick: handleLogin(LOGIN_TYPE.FUEL_WALLET)
        }
    ];
    return (
        <Dialog style={{maxWidth: 360}} {...rest}>
            <Root>
                {/*<Img height="60" width="60" src={logo} />*/}
                <SizedBox height={4}/>
                {window.fuel == null && window.fuelet == null ? (
                    <>
                        <Text>
                            No wallet was detected
                        </Text>
                        <SizedBox height={12}/>
                        <Text
                            style={{cursor: "pointer"}}
                            onClick={() =>
                                window.open("https://wallet.fuel.network/docs/install/")}
                        >
                            Go to wallet
                        </Text>
                    </>
                ) : (
                    <>
                        <Text>
                            Connect wallet
                        </Text>
                        <SizedBox height={4}/>
                        <Text>
                            To start using Spark
                        </Text>
                    </>
                )}
                <SizedBox height={34}/>
                {loginTypes.map(
                    (t, i) =>
                        t.isActive && <LoginType {...t} key={i} onClick={t.onClick}/>
                )}
                <SizedBox height={36}/>
            </Root>
        </Dialog>
    );
};
export default observer(LoginModal);
