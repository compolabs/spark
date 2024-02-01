import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import arrowIcon from "@src/assets/icons/arrowUp.svg";
import userIcon from "@src/assets/icons/user.svg";
import { useStores } from "@src/stores";
import centerEllipsis from "@src/utils/centerEllipsis";

import { SmartFlex } from "../SmartFlex";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "../Text";

interface Props {
  isFocused?: boolean;
  onClick?: () => void;
}

const ConnectedWalletButton: React.FC<Props> = observer(({ isFocused, onClick }) => {
  const { accountStore } = useStores();

  return (
    <Root gap="8px" isFocused={isFocused} center onClick={onClick}>
      <img alt="User" src={userIcon} />
      {/*<img src={healthIcon} alt="health" />*/}
      {centerEllipsis(accountStore.address ?? "", 10)}
      <ArrowIconStyled alt="Arrow Icon" src={arrowIcon} />
    </Root>
  );
});

export default ConnectedWalletButton;

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

  transition: border 400ms;

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
