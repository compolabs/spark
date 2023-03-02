import styled from "@emotion/styled";
import React from "react";
import { Row } from "@components/Flex";

interface IProps {
  values: [string, string];
  active: 0 | 1;
  onActivate: (v: 0 | 1) => void;
  border?: boolean;
}

const Root = styled(Row)<{ border?: boolean }>`
  background: ${({ theme }) => theme.colors.switch.background};
  padding: 2px;
  height: 48px;
  width: 100%;
  box-sizing: border-box;
  border-radius: 32px;
  transition: all 0.3s ease;
`;

const Item = styled.div<{ active?: boolean }>`
  font-weight: 700;
  font-size: 13px;
  line-height: 24px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  flex: 1;
  background: ${({ active, theme }) =>
    active
      ? theme.colors.switchButtons.selectedBackground
      : theme.colors.switchButtons.secondaryBackground};
  width: 100%;
  height: 100%;
  color: ${({ active, theme }) =>
    active
      ? theme.colors.switchButtons.selectedColor
      : theme.colors.switchButtons.secondaryColor};

  border-radius: 32px;
  cursor: pointer;
`;

const SwitchButtons: React.FC<IProps> = ({
  values,
  active,
  onActivate,
  border,
}) => {
  return (
    <Root border={border}>
      <Item active={active === 0} onClick={() => onActivate(0)}>
        {values[0]}
      </Item>
      <Item active={active === 1} onClick={() => onActivate(1)}>
        {values[1]}
      </Item>
    </Root>
  );
};
export default SwitchButtons;
