import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { MENU_ITEMS } from "@src/constants";
import { useStores } from "@src/stores";
import isRoutesEquals from "@src/utils/isRoutesEquals";

import Button from "../Button";
import SizedBox from "../SizedBox";
import { SmartFlex } from "../SmartFlex";

import ConnectedWalletButton from "./ConnectedWalletButton";

interface IProps {
  isOpen: boolean;
  onAccountClick: () => void;
  onWalletConnect: () => void;
  onClose: () => void;
}

const MobileMenu: React.FC<IProps> = ({ isOpen, onAccountClick, onWalletConnect, onClose }) => {
  const { settingsStore, accountStore } = useStores();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleAccountClick = () => {
    onAccountClick();
    onClose();
  };

  const handleConnectWallet = () => {
    onWalletConnect();
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
    <Root isOpen={isOpen}>
      <Body>
        <Container>
          <SizedBox height={8} />
          {MENU_ITEMS.map(({ title, link, route }) => (
            <MenuItem
              key={title}
              selected={isRoutesEquals(title, location.pathname)}
              onClick={() => {
                navigate(title);
                onClose();
              }}
            >
              <Text
                color={
                  isRoutesEquals(link ?? "", location.pathname) ? theme.colors.textPrimary : theme.colors.textSecondary
                }
              >
                {title}
              </Text>
            </MenuItem>
          ))}
        </Container>
        <SizedBox height={8} />
        <FooterContainer>{renderWalletButton()}</FooterContainer>
      </Body>
    </Root>
  );
};

export default observer(MobileMenu);

const Root = styled.div<{ isOpen: boolean }>`
  z-index: 200;
  background: ${({ theme }) => `${theme.colors.bgPrimary}`};
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  height: calc(100vh - 50px);
  transition: 0.2s;
  overflow: hidden;

  ${({ isOpen }) => !isOpen && `height: 0px;`};
  box-sizing: border-box;
  padding: 0 4px;
`;

const Body = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

const MenuItem = styled.div<{ selected?: boolean }>`
  cursor: pointer;
  ${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON_SECONDARY]};
  color: ${({ theme, selected }) => (selected ? theme.colors.redLight : theme.colors.textSecondary)};
  padding: 12px 32px;
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
