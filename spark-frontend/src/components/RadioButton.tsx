import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Text, { TEXT_TYPES } from "./Text";

interface Props {
  label: string;
  value: string;
  isSelected: boolean;
  onChange: (value: string) => void;
}

export const RadioButton: React.FC<Props> = ({ label, value, isSelected, onChange }) => {
  const theme = useTheme();
  const handleClick = () => {
    onChange(value);
  };

  return (
    <Root key={value}>
      <StyledInput checked={isSelected} type="radio" value={value} onChange={handleClick} />
      <StyledRadio checked={isSelected} />
      <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
        {label}
      </Text>
    </Root>
  );
};

const Root = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
`;

const StyledInput = styled.input`
  appearance: none;
  width: 0;
  height: 0;
`;

const StyledRadio = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  border-radius: 100%;
  border: 1px solid ${({ checked, theme }) => (checked ? theme.colors.greenLight : theme.colors.iconSecondary)};
  margin-right: 4px;
  position: relative;

  transition: border-color 250ms;

  &::after {
    content: "";
    position: absolute;

    width: 6px;
    height: 6px;
    border-radius: 100%;

    background-color: ${({ checked, theme }) => (checked ? theme.colors.greenLight : "unset")};

    transition: background-color 250ms;
  }
`;
