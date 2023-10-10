import styled from "@emotion/styled";
import React from "react";
import {observer} from "mobx-react";
import {useStores} from "@stores";
import {LOGIN_TYPE} from "@stores/AccountStore";
import centerEllipsis from "@src/utils/centerEllipsis";
import {Row} from "./Flex";
import {ReactComponent as Logo} from "@src/assets/icons/logo.svg";
import {TEXT_TYPES, TEXT_TYPES_MAP} from "@components/Text";
import Button from "@components/Button";

interface IProps {
}

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 46px;
  padding: 0 16px;
  box-sizing: border-box;
  border: 1px solid white;
`;

const Divider = styled.div`
  margin: 0 20px;
  width: 1px;
  height: 12px;
  background: ${({theme}) => theme.colors.gray2};
`

const MenuItem = styled.div<{ active?: boolean }>`
  cursor: pointer;
  width: 100px;
  text-align: center;
  color: ${({theme}) => theme.colors.gray1};
  ${TEXT_TYPES_MAP[TEXT_TYPES.H3]}
`

const menuItems = ["DASHBOARD", "TRADE", "EARN", "FAUCET", "DOCS", "MORE"]


const Header: React.FC<IProps> = observer(() => {
    const {accountStore} = useStores()
    return <Root>
        <Row alignItems="center">
            <a rel="noreferrer noopener" href="/"><Logo/></a>
            <Divider/>
            {menuItems.map((item, key) => <MenuItem key={key}>{item}</MenuItem>)}
        </Row>
        {accountStore.address != null
            ? <Button fitContent
                      onClick={accountStore.disconnect}>Disconnect {centerEllipsis(accountStore.address, 8)}</Button>
            : <Button fitContent primary onClick={() => accountStore.login(LOGIN_TYPE.FUEL_WALLET)}>Connect fuel
                wallet</Button>
        }
    </Root>;
})
export default Header;
