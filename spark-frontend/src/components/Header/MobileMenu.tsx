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

import ConnectedWallet from "./ConnectedWallet";

interface IProps {
  onClose: () => void;
  isOpen: boolean;
}

const MobileMenu: React.FC<IProps> = ({ isOpen, onClose }) => {
  const { settingsStore, accountStore } = useStores();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

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
          <SizedBox height={92} />
        </Container>
        <SizedBox height={8} />

        {accountStore.address ? (
          <>
            <Button color="primary" onClick={() => settingsStore.setDepositModal(true)}>
              Deposit / Withdraw
            </Button>
            <SizedBox height={4} />
            <ConnectedWallet />
          </>
        ) : (
          <Button
            green
            onClick={() => {
              //
              // navigate(ROUTES.CONNECT);
              onClose();
            }}
          >
            Connect wallet
          </Button>
        )}
      </Body>
    </Root>
  );
};

export default observer(MobileMenu);

const Root = styled.div<{ isOpen: boolean }>`
  z-index: 100;
  background: ${({ theme }) => `${theme.colors.bgPrimary}`};
  position: absolute;
  top: 48px;
  left: 0;
  right: 0;
  height: calc(100vh - 64px);
  transition: 0.2s;
  overflow: hidden;

  ${({ isOpen }) => !isOpen && `height: 0px;`};
  box-sizing: border-box;
  padding: 0 4px;
`;

const Body = styled.div`
  display: flex;
  width: 100%;
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
`;
