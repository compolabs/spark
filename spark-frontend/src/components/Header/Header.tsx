import React from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import ConnectedWallet from "@components/Header/ConnectedWallet";
import Tab from "@components/Tab";
import { TEXT_TYPES } from "@components/Text";
import { ReactComponent as Logo } from "@src/assets/icons/logo.svg";
import { ReactComponent as Menu } from "@src/assets/icons/menu.svg";
import { MENU_ITEMS } from "@src/constants";
import useFlag from "@src/hooks/useFlag";
import { useMedia } from "@src/hooks/useMedia";
import ConnectWalletDialog from "@src/screens/ConnectWallet";
import { media } from "@src/themes/breakpoints";
import isRoutesEquals from "@src/utils/isRoutesEquals";
import { useStores } from "@stores";

import { AccountInfoSheet } from "../Modal";
import { SmartFlex } from "../SmartFlex";

import ConnectedWalletButton from "./ConnectedWalletButton";
import MobileMenu from "./MobileMenu";

interface IProps {}

const Header: React.FC<IProps> = observer(() => {
  const { accountStore } = useStores();
  const location = useLocation();
  const media = useMedia();

  const [isMobileMenuOpen, openMobileMenu, closeMobileMenu] = useFlag();
  const [isConnectDialogVisible, openConnectDialog, closeConnectDialog] = useFlag();
  const [isAccountInfoSheetOpen, openAccountInfo, closeAccountInfo] = useFlag();

  const toggleMenu = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.body.classList.toggle("noscroll", !isMobileMenuOpen);

    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  const renderWallet = () => {
    if (!accountStore.address) {
      return (
        <WalletContainer>
          <Button fitContent green onClick={openConnectDialog}>
            Connect wallet
          </Button>
        </WalletContainer>
      );
    }

    if (media.mobile) {
      return (
        <WalletContainer isVisible={!isMobileMenuOpen}>
          <ConnectedWalletButton onClick={openAccountInfo} />
        </WalletContainer>
      );
    }

    return (
      <WalletContainer>
        <ConnectedWallet />
      </WalletContainer>
    );
  };

  const renderMobile = () => {
    return (
      <>
        <SmartFlex center="y">
          <a href="/" rel="noreferrer noopener">
            <Logo />
          </a>
        </SmartFlex>
        <SmartFlex center="y" gap="8px">
          {renderWallet()}
          <MenuContainer onClick={toggleMenu}>
            <Menu />
          </MenuContainer>
        </SmartFlex>
      </>
    );
  };

  const renderDesktop = () => {
    return (
      <>
        <SmartFlex center="y">
          <a href="/" rel="noreferrer noopener">
            <Logo />
          </a>
          <Divider />
          <SmartFlex gap="28px">
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
                    <Tab
                      key={title}
                      active={isRoutesEquals(route, location.pathname)}
                      type={TEXT_TYPES.BUTTON_SECONDARY}
                    >
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
          </SmartFlex>
        </SmartFlex>
        <SmartFlex center="y">{renderWallet()}</SmartFlex>
      </>
    );
  };

  return (
    <Root>
      {media.mobile ? renderMobile() : renderDesktop()}

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onAccountClick={openAccountInfo}
        onClose={closeMobileMenu}
        onWalletConnect={openConnectDialog}
      />
      <ConnectWalletDialog visible={isConnectDialogVisible} onClose={closeConnectDialog} />
      <AccountInfoSheet isOpen={isAccountInfoSheetOpen} onClose={closeAccountInfo} />
    </Root>
  );
});

export default Header;

const Root = styled(SmartFlex)`
  justify-content: space-between;
  width: 100%;
  height: 48px;
  padding: 0 12px;

  ${media.mobile} {
    height: 42px;
    padding: 0 8px;
    margin: 4px 0;
  }
`;

const Divider = styled.div`
  margin: 0 16px;
  width: 1px;
  height: 32px;
  background: ${({ theme }) => theme.colors.bgSecondary};
`;

const MenuContainer = styled(SmartFlex)`
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  border-radius: 100%;
  padding: 4px;
`;

const WalletContainer = styled(SmartFlex)<{ isVisible?: boolean }>`
  opacity: ${({ isVisible = true }) => (isVisible ? "1" : "0")};
  transition: opacity 150ms;

  ${media.mobile} {
    ${Button} {
      height: 32px;
    }
  }
`;
