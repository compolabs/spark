import React, { useState } from "react";
import styled from "@emotion/styled";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react";

import Divider from "@components/Divider";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import Tooltip from "@components/Tooltip";
import copyIcon from "@src/assets/icons/copy.svg";
import linkIcon from "@src/assets/icons/link.svg";
import logoutIcon from "@src/assets/icons/logout.svg";
import BN from "@src/utils/BN";
import { getExplorerLinkByAddress } from "@src/utils/getExplorerLink";
import { useStores } from "@stores";

import ConnectedWalletButton from "./ConnectedWalletButton";

const ConnectedWallet: React.FC = observer(() => {
  const { accountStore, blockchainStore, notificationStore, balanceStore } = useStores();
  const [isFocused, setIsFocused] = useState(false);

  const bcNetwork = blockchainStore.currentInstance;

  const ethBalance = BN.formatUnits(
    balanceStore.getBalance(bcNetwork!.getTokenBySymbol("ETH").assetId) ?? BN.ZERO,
    bcNetwork!.getTokenBySymbol("ETH").decimals,
  )?.toFormat(4);

  const handleAddressCopy = () => {
    accountStore.address && copy(accountStore.address);
    notificationStore.toast(`Your address was copied`, { type: "info" });
  };

  const actions = [
    {
      icon: copyIcon,
      action: handleAddressCopy,
      title: "Copy address",
      active: true,
    },
    {
      icon: linkIcon,
      action: () => window.open(getExplorerLinkByAddress(accountStore.address!, bcNetwork!.NETWORK_TYPE)),
      title: "View in Explorer",
      active: true,
    },
    {
      icon: logoutIcon,
      action: () => accountStore.disconnect(),
      title: "Disconnect",
      active: true,
    },
  ];

  const renderActions = () => {
    return actions.map(
      ({ title, action, active, icon }) =>
        active && (
          <ActionRow key={title} onClick={action}>
            <Icon alt="ETH" src={icon} />
            <Text type={TEXT_TYPES.BUTTON_SECONDARY}>{title}</Text>
          </ActionRow>
        ),
    );
  };

  return (
    <Tooltip
      config={{
        placement: "bottom-start",
        trigger: "click",
        onVisibleChange: setIsFocused,
      }}
      content={
        <Column crossAxisSize="max">
          <ActionRow>
            <Icon alt="ETH" src={bcNetwork?.getTokenBySymbol("ETH").logo} />
            <SizedBox width={8} />
            <Text type={TEXT_TYPES.BUTTON_SECONDARY}>{`${ethBalance} ETH`}</Text>
          </ActionRow>
          <Divider />
          {renderActions()}
        </Column>
      }
    >
      <ConnectedWalletButton isFocused={isFocused} />
    </Tooltip>
  );
});

export default ConnectedWallet;

const Icon = styled.img`
  width: 24px;
  height: 24px;
`;

const ActionRow = styled(Row)`
  padding: 8px 16px;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  transition: background-color 150ms;

  &:hover {
    background-color: ${({ theme }) => theme.colors.borderPrimary};
  }
`;
