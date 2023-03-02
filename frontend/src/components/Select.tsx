import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import Tooltip from "./Tooltip";
// import arrowIcon from "@src/assets/icons/arrowRightBorderless.svg";
// import check from "@src/assets/icons/checkMark.svg";
import SizedBox from "@components/SizedBox";
import { Column } from "./Flex";
import { useTheme } from "@emotion/react";
import Text from "@components/Text";

interface IOption {
  key: string;
  title: string;
}

interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  options: IOption[];
  selected?: IOption;
  onSelect: (key: IOption) => void;
}

const Root = styled.div<{ focused?: boolean }>`
  display: flex;
  padding: 10px 10px 10px 12px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.header.walletAddressBackground};
  outline: none;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.colors.neutral5};
  align-items: center;
  white-space: nowrap;

  .menu-arrow {
    transition: 0.4s;
    transform: ${({ focused }) =>
      focused ? "rotate(-90deg)" : "rotate(0deg)"};
  }
`;
const Option = styled.div<{ active?: boolean }>`
  width: 100%;
  display: flex;
  cursor: pointer;
  position: relative;
  align-items: center;
  font-weight: 700;
  font-size: 13px;
  line-height: 16px;
  padding: 10px 12px 10px 22px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 -16px;
  white-space: nowrap;

  :hover {
    background: ${({ theme }) => theme.colors.tooltip.hoverElement};
    border-radius: 4px;
  }

  ::after {
    transition: 0.4s;
    position: absolute;
    right: 12px;
  }
`;

const Select: React.FC<IProps> = ({ options, selected, onSelect, ...rest }) => {
  const [focused, setFocused] = useState(false);
  const { images } = useTheme();
  return (
    <Tooltip
      config={{
        placement: "bottom-start",
        trigger: "click",
        onVisibleChange: setFocused,
      }}
      content={
        <Column
          crossAxisSize="max"
          style={{ borderRadius: 4, padding: "6px 8px" }}
        >
          {options.map((v) => {
            const active = selected?.key === v.key;
            return (
              <Option
                active={active}
                key={v.key + "_option"}
                onClick={() => {
                  onSelect(v);
                }}
              >
                {v.title}
              </Option>
            );
          })}
        </Column>
      }
    >
      <Root
        focused={focused}
        onClick={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      >
        <Text size="small">{selected?.title ?? options[0].title}</Text>
        <SizedBox width={10} />
        <img src={images.icons.arrowDown} className="menu-arrow" alt="arrow" />
      </Root>
    </Tooltip>
  );
};
export default Select;
