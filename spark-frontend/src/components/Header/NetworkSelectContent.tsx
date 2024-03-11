import React, { useMemo } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { AVAILABLE_NETWORKS, NETWORK } from "@src/blockchain/types";
import { useStores } from "@src/stores";

import { SmartFlex } from "../SmartFlex";
import Text, { TEXT_TYPES } from "../Text";

interface Props {
  onNetworkClick: (type: NETWORK) => void;
}

const NetworkSelectContent: React.FC<Props> = observer(({ onNetworkClick }) => {
  const { blockchainStore } = useStores();
  const theme = useTheme();

  const activeNetwork = useMemo(() => {
    return AVAILABLE_NETWORKS.find(({ type }) => type === blockchainStore.currentInstance?.NETWORK_TYPE);
  }, [blockchainStore.currentInstance?.NETWORK_TYPE]);

  return (
    <SmartFlex column>
      <SmartFlex padding="4px 16px">
        <Text>Networks</Text>
      </SmartFlex>
      {AVAILABLE_NETWORKS.map(({ title, icon, type }, index) => (
        <NetworkContainer key={index} center="y" gap="4px" onClick={() => onNetworkClick(type)}>
          <img alt={title} src={icon} />
          <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
            {title}
          </Text>
          <Status isActive={type === activeNetwork?.type} />
        </NetworkContainer>
      ))}
    </SmartFlex>
  );
});

export default NetworkSelectContent;

const Status = styled.div<{ isActive?: boolean }>`
  width: 8px;
  height: 8px;

  opacity: ${({ isActive }) => (isActive ? 1 : 0)};
  margin-bottom: 2px;

  background-color: ${({ theme }) => theme.colors.greenLight};
  border-radius: 100%;
  transition: opacity 250ms;
`;

const NetworkContainer = styled(SmartFlex)`
  padding: 8px 16px;

  cursor: pointer;

  transition: background-color 150ms;

  &:hover {
    background-color: ${({ theme }) => theme.colors.borderPrimary};
  }
`;
