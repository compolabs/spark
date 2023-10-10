import React, {PropsWithChildren} from "react";
import styled from "@emotion/styled";
import {TEXT_TYPES, TEXT_TYPES_MAP} from "@components/Text";

//TODO use colors from theme
const Button = styled.button<{
    primary?: boolean,
    secondary?: boolean,
    outline?: boolean,
    fitContent?: boolean;
}>`
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  transition: 0.4s;
  height: ${({outline}) => outline ? 26 : 32}px;
  border-radius: 100px;
  box-shadow: none;
  color: ${({outline, theme}) => outline ? theme.colors.gray1 : theme.colors.white};
  ${({outline}) => outline ? TEXT_TYPES_MAP[TEXT_TYPES.BUTTON] : TEXT_TYPES_MAP[TEXT_TYPES.H1]}
  width: ${({fitContent}) => (fitContent ? "fit-content" : "100%")};
  padding: 0 12px;
  outline: none;
  
  border: 1px solid ${({theme, primary, secondary, outline}) => {
    if (primary) return theme.colors.green
    else if (secondary) return theme.colors.red
    else if (outline) return theme.colors.gray3
    else return theme.colors.gray1
  }};
  opacity: 0.9;
  background-color: ${({primary, secondary, outline, theme}) => {
    if (primary) return 'rgba(0, 255, 152, 0.10)'
    else if (secondary) return 'rgba(253, 10, 83, 0.10)'
    else if (outline) return theme.colors.gray5
    else return 'rgba(255, 255, 253, 0.10)'
  }};

  :hover {
    background-color: ${({primary, secondary, outline, theme}) => {
      if (primary) return 'rgba(0, 255, 152, 0.40)'
      else if (secondary) return 'rgba(253, 10, 83, 0.40)'
      else if (outline) return theme.colors.gray5
      else return 'rgba(255, 255, 253, 0.40)'
    }};
    border: 1px solid ${({theme, primary, secondary, outline}) => {
      if (primary) return theme.colors.green
      else if (secondary) return theme.colors.red
      else if (outline) return theme.colors.gray2
      else return theme.colors.gray1
    }};
    cursor: pointer;
  }

  :disabled {
    border: ${({outline, theme}) => outline ? `1px solid ${theme.colors.gray3}` : 0};
    background-color: ${({primary, secondary, outline, theme}) => {
      if (primary) return 'rgba(0, 255, 152, 0.10)'
      else if (secondary) return 'rgba(253, 10, 83, 0.10)'
      else if (outline) return theme.colors.gray5
      else return 'rgba(255, 255, 253, 0.10)'
    }};
    opacity: 0.4;
    cursor: not-allowed;
  }


`;

export default Button;

interface IButtonGroupProps extends PropsWithChildren {
}

const ButtonGroupRoot = styled.div`
  display: flex;
  width: 100%;

  & > button {
    height: 44px;
    border-radius: 0;
    ${TEXT_TYPES_MAP[TEXT_TYPES.BODY_LARGE]}
  }

  & > :first-of-type {
    border-radius: 10px 0 0 10px;
  }

  & > :last-of-type {
    border-radius: 0 10px 10px 0;
  }
`;

export const ButtonGroup: React.FC<IButtonGroupProps> = ({children}) => {
    return <ButtonGroupRoot>
        {children}
    </ButtonGroupRoot>;
}


