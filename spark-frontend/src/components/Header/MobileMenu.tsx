import React from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { MENU_ITEMS } from "@src/constants";
import { useStores } from "@src/stores";
import isRoutesEquals from "@src/utils/isRoutesEquals";

import Button from "../Button";
import MenuOverlay from "../MenuOverlay";
import SizedBox from "../SizedBox";
import { SmartFlex } from "../SmartFlex";

import ConnectedWalletButton from "./ConnectedWalletButton";
import NetworkSelectButton from "./NetworkSelectButton";

interface IProps {
  isOpen: boolean;
  onAccountClick: () => void;
  onWalletConnect: () => void;
  onNetworkSelect: () => void;
  onClose: () => void;
}

const MobileMenu: React.FC<IProps> = ({ isOpen, onAccountClick, onWalletConnect, onClose, onNetworkSelect }) => {
  const { accountStore } = useStores();
  const location = useLocation();

  const handleAccountClick = () => {
    onAccountClick();
    onClose();
  };

  const handleConnectWallet = () => {
    onWalletConnect();
    onClose();
  };

  const handleNetworkSelect = () => {
    onNetworkSelect();
    onClose();
  };

  const renderWalletButton = () => {
    return accountStore.address ? (
      <ConnectedWalletButtonStyled onClick={handleAccountClick} />
    ) : (
      <Button green onClick={handleConnectWallet}>
        Connect wallet
      </Button>
    );
  };

  return (
    <MenuOverlay isOpen={isOpen} top={50} zIndex={300}>
      <Body>
        <Container>
          <SizedBox height={8} />
          {MENU_ITEMS.map(({ title, link, route }) => {
            if (!link && !route) {
              return (
                <MenuItem key={title}>
                  <Text>{title}</Text>
                </MenuItem>
              );
            } else if (route) {
              return (
                <Link key={title} to={route} onClick={onClose}>
                  <MenuItem key={title} isSelected={isRoutesEquals(route, location.pathname)}>
                    <Text>{title}</Text>
                  </MenuItem>
                </Link>
              );
            } else if (link) {
              return (
                <a key={title} href={link} rel="noopener noreferrer" target="_blank">
                  <MenuItem key={title}>
                    <Text>{title}</Text>
                  </MenuItem>
                </a>
              );
            }

            return null;
          })}
        </Container>
        <SizedBox height={8} />
        <FooterContainer gap="8px" column>
          {renderWalletButton()}
          {!accountStore.address && <NetworkSelectButton onClick={handleNetworkSelect} />}
        </FooterContainer>
      </Body>
    </MenuOverlay>
  );
};

export default observer(MobileMenu);

const Body = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

const MenuItem = styled.div<{ isSelected?: boolean }>`
  cursor: pointer;
  ${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON_SECONDARY]};
  padding: 12px 32px;

  ${Text} {
    color: ${({ theme, isSelected }) => (isSelected ? theme.colors.textPrimary : theme.colors.textSecondary)};
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => `${theme.colors.bgSecondary}`};
  border-radius: 10px;
  height: 100%;
`;

const FooterContainer = styled(SmartFlex)`
  margin-bottom: 48px;
  width: 100%;
`;

const ConnectedWalletButtonStyled = styled(ConnectedWalletButton)`
  width: 100%;
  height: 40px;
`;
