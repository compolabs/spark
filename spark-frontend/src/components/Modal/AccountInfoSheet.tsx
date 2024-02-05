import React from "react";
import styled from "@emotion/styled";
import copy from "copy-to-clipboard";

import copyIcon from "@src/assets/icons/copy.svg";
import linkIcon from "@src/assets/icons/link.svg";
import logoutIcon from "@src/assets/icons/logout.svg";
import { EXPLORER_URL, TOKENS_BY_SYMBOL } from "@src/constants";
import { useStores } from "@src/stores";
import BN from "@src/utils/BN";

import Divider from "../Divider";
import Sheet from "../Sheet";
import { SmartFlex } from "../SmartFlex";
import Text, { TEXT_TYPES } from "../Text";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AccountInfoSheet: React.FC<Props> = ({ isOpen, onClose }) => {
  const { accountStore, notificationStore, balanceStore } = useStores();

  const ethBalance = BN.formatUnits(
    balanceStore.getBalance(TOKENS_BY_SYMBOL.ETH.assetId) ?? BN.ZERO,
    TOKENS_BY_SYMBOL.ETH.decimals,
  )?.toFormat(4);

  const handleCopy = (object: string) => {
    object === "address"
      ? accountStore.address && copy(accountStore.address)
      : accountStore.mnemonic && copy(accountStore.mnemonic);
    notificationStore.toast(`Your ${object} was copied`, { type: "info" });
    onClose();
  };

  const handleDisconnect = () => {
    accountStore.disconnect();
    onClose();
  };

  const actions = [
    {
      icon: copyIcon,
      action: () => handleCopy("address"),
      title: "Copy address",
      active: true,
    },
    {
      icon: copyIcon,
      action: () => handleCopy("seed"),
      title: "Copy seed",
      active: !!accountStore.mnemonic,
    },
    {
      icon: linkIcon,
      action: () => window.open(`${EXPLORER_URL}/address/${accountStore.address}`),
      title: "View in Explorer",
      active: true,
    },
  ];

  const renderActions = () => {
    return actions.map(
      ({ title, action, active, icon }) =>
        active && (
          <ActionItem key={title} center="y" onClick={action}>
            <Icon alt="ETH" src={icon} />
            <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              {title}
            </Text>
          </ActionItem>
        ),
    );
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <SmartFlex column>
        <TokenContainer center="y" gap="8px">
          <Icon alt="ETH" src={TOKENS_BY_SYMBOL.ETH.logo} />
          <Text type={TEXT_TYPES.H} primary>{`${ethBalance} ETH`}</Text>
        </TokenContainer>
        <Divider />
        <SmartFlex center="y" column>
          {renderActions()}
        </SmartFlex>
        <Divider />
        <FooterContainer>
          <ActionItem center="y" onClick={handleDisconnect}>
            <Icon alt="ETH" src={logoutIcon} />
            <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              Disconnect
            </Text>
          </ActionItem>
        </FooterContainer>
      </SmartFlex>
    </Sheet>
  );
};

export default AccountInfoSheet;

const TokenContainer = styled(SmartFlex)`
  padding: 8px 16px;
`;

const ActionItem = styled(SmartFlex)`
  padding: 8px 16px;
  gap: 4px;
  width: 100%;

  transition: background-color 150ms;

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.colors.borderPrimary};
  }
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
`;

const FooterContainer = styled(SmartFlex)`
  margin-bottom: 40px;
`;
