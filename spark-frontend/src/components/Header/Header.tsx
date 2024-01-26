import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import { DesktopRow, MobileRow, Row } from "@components/Flex";
import ConnectedWallet from "@components/Header/ConnectedWallet";
import SizedBox from "@components/SizedBox";
import Tab from "@components/Tab";
import { TEXT_TYPES } from "@components/Text";
import { ReactComponent as Logo } from "@src/assets/icons/logo.svg";
import { ROUTES } from "@src/constants";
import useFlag from "@src/hooks/useFlag";
import ConnectWalletDialog from "@src/screens/ConnectWallet";
import isRoutesEquals from "@src/utils/isRoutesEquals";
import { useStores } from "@stores";

// import DepositWithdrawModal from "@screens/TradeScreen/DepositWithdrawModal";
import MobileMenu from "./MobileMenu";
import MobileMenuIcon from "./MobileMenuIcon";

interface IProps {}

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 48px;
  padding: 0 12px;
  box-sizing: border-box;
  flex-shrink: 0;

  * {
    text-decoration: none;
  }
`;

const Divider = styled.div`
  margin: 0 16px;
  width: 1px;
  height: 32px;
  background: ${({ theme }) => theme.colors.bgSecondary};
`;

type TMenuItem = {
  title: string;
  route?: string;
  link?: string;
};

const TabContainer = styled(DesktopRow)`
  & > * {
    margin-right: 28px;
  }
`;
export const MENU_ITEMS: Array<TMenuItem> = [
  { title: "TRADE", route: ROUTES.ROOT },
  { title: "FAUCET", route: ROUTES.FAUCET },
  { title: "DOCS", link: "https://docs.sprk.fi" },
  { title: "GITHUB", link: "https://github.com/compolabs/spark" },
];

// const SettingsButton = styled(Button)`
// 	border-radius: 32px;
// 	padding: 2px 4px;

// 	path {
// 		fill: ${({ theme }) => theme.colors.iconSecondary};
// 	}

// 	:active {
// 		path {
// 			fill: ${({ theme }) => theme.colors.iconPrimary};
// 		}
// 	}

// 	:disabled {
// 		path {
// 			fill: ${({ theme }) => theme.colors.iconDisabled};
// 		}
// 	}
// `;

const Header: React.FC<IProps> = observer(() => {
  const { accountStore } = useStores();
  const location = useLocation();

  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const [isConnectDialogVisible, openConnectDialog, closeConnectDialog] = useFlag();

  const toggleMenu = (state: boolean) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.body.classList.toggle("noscroll", state);
    setMobileMenuOpened(state);
  };

  return (
    <Root>
      <Row alignItems="center">
        <a href="/" rel="noreferrer noopener">
          <Logo />
        </a>
        <Divider />
        <TabContainer>
          {MENU_ITEMS.map(({ title, link, route }) => {
            if (!link && !route)
              return (
                <Tab key={title} type={TEXT_TYPES.BUTTON_SECONDARY}>
                  {title}
                </Tab>
              );
            else if (route)
              return (
                <Link key={title} to={route}>
                  <Tab key={title} active={isRoutesEquals(route, location.pathname)} type={TEXT_TYPES.BUTTON_SECONDARY}>
                    {title}
                  </Tab>
                </Link>
              );
            else if (link)
              return (
                <a key={title} href={link} rel="noopener noreferrer" target="_blank">
                  <Tab key={title} type={TEXT_TYPES.BUTTON_SECONDARY}>
                    {title}
                  </Tab>
                </a>
              );
            else return null;
          })}
        </TabContainer>
      </Row>
      <Row alignItems="center" justifyContent="flex-end" mainAxisSize="fit-content">
        <MobileRow>
          <MobileMenuIcon opened={mobileMenuOpened} onClick={() => toggleMenu(!mobileMenuOpened)} />
        </MobileRow>
        {/*<DesktopRow>*/}
        {/*	{accountStore.address != null && (*/}
        {/*		<>*/}
        {/*			<SettingsButton onClick={() => settingsStore.setDepositModal(true)}>Deposit/Withdraw</SettingsButton>*/}
        {/*			<SizedBox width={10} />*/}
        {/*		</>*/}
        {/*	)}*/}
        {/*</DesktopRow>*/}
        {!mobileMenuOpened && <SizedBox width={16} />}
        {!mobileMenuOpened ? (
          accountStore.address ? (
            <ConnectedWallet />
          ) : (
            <Button fitContent green onClick={openConnectDialog}>
              Connect wallet
            </Button>
          )
        ) : (
          <></>
        )}
      </Row>
      {/*<DepositWithdrawModal*/}
      {/*	visible={settingsStore.depositModalOpened}*/}
      {/*	onClose={() => settingsStore.setDepositModal(false)}*/}
      {/*/>*/}
      <MobileMenu opened={mobileMenuOpened} onClose={() => toggleMenu(false)} />

      <ConnectWalletDialog visible={isConnectDialogVisible} onClose={closeConnectDialog} />
    </Root>
  );
});
export default Header;
