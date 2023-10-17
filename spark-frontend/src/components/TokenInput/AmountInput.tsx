import React from "react";
import styled from "@emotion/styled";

const Root = styled.input<{ small?: boolean }>`

  font-family: JetBrains Mono,serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0.48px;
  caret-color: ${({ theme }) => theme.colors.gray1};
  border: none;
  background: transparent;
  outline: none;
  width: 100%;

  color: ${({ theme }) => theme.colors.gray1};

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  [type="number"] {
    -moz-appearance: textfield;
  }

  ::placeholder {
    color: ${({ theme }) => theme.colors.gray2};
  }
`;

type TProps = React.InputHTMLAttributes<HTMLInputElement> & { small?: boolean };

const AmountInput = React.forwardRef<HTMLInputElement, TProps>(
  ({ onWheel, ...props }, ref) => (
    <Root
      {...props}
      ref={ref}
      small={props.small}
      type="number"
      onWheel={(e) => {
        e.target && (e.target as any).blur();
        onWheel && onWheel(e);
      }}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
    />
  )
);

AmountInput.displayName = "AmountInput";

export default AmountInput;
