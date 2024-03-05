import React, { useMemo } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import arrowIcon from "@src/assets/icons/arrowUp.svg";
import { AVAILABLE_NETWORKS } from "@src/blockchain/types";
import { media } from "@src/themes/breakpoints";
import { useStores } from "@stores";

import { SmartFlex } from "../SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "../Text";

interface Props {
  isSmall?: boolean;
  isFocused?: boolean;
  className?: string;
  onClick?: () => void;
}

const NetworkSelectButton: React.FC<Props> = observer(({ isSmall, isFocused, className, onClick }) => {
  const { blockchainStore } = useStores();
  const theme = useTheme();

  const activeNetwork = useMemo(() => {
    return AVAILABLE_NETWORKS.find(({ type }) => type === blockchainStore.currentInstance?.NETWORK_TYPE);
  }, [blockchainStore.currentInstance?.NETWORK_TYPE]);

  return (
    <Root className={className} gap={isSmall ? "0" : "8px"} isFocused={isFocused} center onClick={onClick}>
      <img alt={activeNetwork?.title} src={activeNetwork?.icon} />
      {!isSmall && (
        <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
          {activeNetwork?.title}
        </Text>
      )}
      <ArrowIconStyled alt="Arrow Icon" src={arrowIcon} />
    </Root>
  );
});

export default NetworkSelectButton;

const ArrowIconStyled = styled.img`
  transition: 0.4s;
`;

const Root = styled(SmartFlex)<{
  isFocused?: boolean;
}>`
  background: transparent;
  padding: 4px 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]};
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  border-radius: 32px;

  ${media.mobile} {
    padding: 8px 8px;
  }

  transition: border 400ms;

  cursor: pointer;

  ${ArrowIconStyled} {
    transform: ${({ isFocused }) => (isFocused ? "rotate(-180deg)" : "rotate(0)")};
  }

  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.borderAccent};

    ${ArrowIconStyled} {
      transform: ${({ isFocused }) => (isFocused ? "rotate(-180deg)" : "rotate(-90deg)")};
    }
  }
`;
