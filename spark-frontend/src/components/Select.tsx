import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import Tooltip from "./Tooltip";
import arrowIcon from "@src/assets/icons/arrowUp.svg";
import SizedBox from "@components/SizedBox";
import { Column } from "./Flex";
import Text, { TEXT_TYPES } from "./Text";

interface IOption {
  key: string;
  title: string;
}

interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  options: IOption[];
  selected?: IOption;
  onSelect: (key: IOption) => void;
  label?: string;
}

const Root = styled.div<{ focused?: boolean }>`
  display: flex;
  padding: 8px 10px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.gray5};
  border: 1px solid
    ${({ focused, theme }) =>
      focused ? theme.colors.gray1 : theme.colors.gray5};

  font-family: Space Grotesk;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  color: ${({ theme, focused }) =>
    focused ? theme.colors.white : theme.colors.gray1};
  align-items: center;
  white-space: nowrap;

  .menu-arrow {
    transition: 0.4s;
    transform: ${({ focused }) =>
      focused ? "rotate(0deg)" : "rotate(-180deg)"};
  }
`;
const Option = styled.div<{ active?: boolean }>`
  font-family: Space Grotesk;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  width: 100%;
  display: flex;
  cursor: pointer;
  position: relative;
  align-items: center;
  color: ${({ active, theme }) => (active ? theme.colors.white : "#FFF")};
  padding: 8px 10px;
  margin: 0 -16px;
  white-space: nowrap;

  :hover {
    color: #fff;
  }
`;

const Select: React.FC<IProps> = ({
  options,
  selected,
  onSelect,
  label,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <Tooltip
      config={{
        placement: "bottom-start",
        trigger: "click",
        onVisibleChange: setFocused
      }}
      content={
        <Column crossAxisSize="max">
          {options.map((v) => {
            const active = selected?.key === v.key;
            return (
              <Option
                active={active}
                key={v.key + "_option"}
                onClick={() => onSelect(v)}
              >
                {v.title}
              </Option>
            );
          })}
        </Column>
      }
    >
      <Column>
        <Text type={TEXT_TYPES.LABEL} color="#676767">
          {label?.toUpperCase()}
        </Text>
        <SizedBox height={4} />
        <Root
          focused={focused}
          onClick={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        >
          {selected?.title ?? options[0].title}
          <SizedBox width={10} />
          <img src={arrowIcon} className="menu-arrow" alt="arrow" />
        </Root>
      </Column>
    </Tooltip>
  );
};
export default Select;
