import React from "react";
import styled from "@emotion/styled";

type TProps = React.InputHTMLAttributes<HTMLInputElement> & {
  small?: boolean;
  onWheel?: React.WheelEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  inputRef?: React.RefObject<HTMLInputElement>;
};

const AmountInput: React.FC<TProps> = ({ onWheel, inputRef, ...props }) => (
  <Root
    {...props}
    ref={inputRef}
    small={props.small}
    onBlur={props.onBlur}
    onFocus={props.onFocus}
    onWheel={(e) => {
      e.target && (e.target as any).blur();
      onWheel && onWheel(e);
    }}
  />
);

export default AmountInput;

const Root = styled.input<{
  small?: boolean;
}>`
  caret-color: ${({ theme }) => theme.colors.textPrimary};
  border: none;
  background: transparent;
  outline: none;
  width: 100%;

  color: ${({ theme }) => theme.colors.textPrimary};

  :disabled {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  [type="number"] {
    -moz-appearance: textfield;
  }

  ::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
