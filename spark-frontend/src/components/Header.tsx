import styled from "@emotion/styled";
import React from "react";
import {observer} from "mobx-react";
import {useStores} from "@stores";
import {LOGIN_TYPE} from "@stores/AccountStore";
import centerEllipsis from "@src/utils/centerEllipsis";

interface IProps {
}

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  box-sizing: border-box;
  border: 1px solid white;
`;

const Header: React.FC<IProps> = observer(() => {
    const {accountStore} = useStores()
    return <Root>
        <h1>spark</h1>
        {accountStore.address != null
            ? <button onClick={accountStore.disconnect}>Disconnect {centerEllipsis(accountStore.address, 8)}</button>
            : <button onClick={() => accountStore.login(LOGIN_TYPE.FUEL_WALLET)}>Connect fuel wallet</button>
        }
    </Root>;
})
export default Header;
