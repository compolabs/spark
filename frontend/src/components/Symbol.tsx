import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import { useTheme } from "@emotion/react";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  disabled?: boolean;
  type: "minus" | "plus";
}

const Root = styled.div<{ selected?: boolean; disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  z-index: 2;

  background-color: ${({ theme, selected, disabled }) =>
    disabled
      ? theme.colors.supplyBtn.backgroundDisabled
      : selected
      ? theme.colors.supplyBtn.backgroundSelected
      : theme.colors.supplyBtn.background};

  :hover {
    background-color: ${({ theme, disabled }) =>
      !disabled && theme.colors.supplyBtn.backgroundSelected};
  }

  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const Symbol: React.FC<IProps> = ({ selected, type, disabled, onClick }) => {
  const theme = useTheme();
  return (
    <Root selected={selected} onClick={onClick} disabled={disabled}>
      <img
        style={{ width: 8, height: 8 }}
        src={
          type === "minus" ? theme.images.icons.minus : theme.images.icons.plus
        }
        alt="symbol"
      />
    </Root>
  );
};
export default Symbol;
