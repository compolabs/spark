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
  width: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const Item = styled.div<{ active?: boolean }>`
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  flex: 1;
  height: 26px;
  font-weight: 600;
  font-size: 11px;
  line-height: 12px;
  width: 100%;
  color: #ffffff;

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
      <Item
        style={{ background: active === 0 ? "#25B05B" : "#3A4050" }}
        active={active === 0}
        onClick={() => onActivate(0)}
      >
        {values[0]}
      </Item>
      <Item
        style={{ background: active === 1 ? "#FF6A55" : "#3A4050" }}
        active={active === 1}
        onClick={() => onActivate(1)}
      >
        {values[1]}
      </Item>
    </Root>
  );
};
export default SwitchButtons;
