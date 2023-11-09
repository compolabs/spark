import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import Tooltip from "./Tooltip";
import arrowIcon from "@src/assets/icons/arrowUp.svg";
import SizedBox from "@components/SizedBox";
import { Column } from "./Flex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "./Text";
import { useTheme } from "@emotion/react";

interface IOption {
	key: string;
	title: string;
	disabled?: boolean;
}

interface IProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
	options: IOption[];
	selected?: IOption;
	onSelect: (option: IOption) => void;
	label?: string;
}

const Root = styled.div<{ focused?: boolean }>`
  display: flex;
  padding: 8px 10px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.gray5};
  border: 1px solid ${({ focused, theme }) => (focused ? theme.colors.gray1 : theme.colors.gray5)};

  color: ${({ theme, focused }) => theme.colors.white};
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
}
`;
export const Option = styled.div<{ active?: boolean; disabled?: boolean }>`
	width: calc(100% + 32px);
	display: flex;
	cursor: ${({ disabled }) => (!disabled ? "pointer" : "not-allowed")};
	position: relative;
	align-items: center;
	color: ${({ active, theme, disabled }) =>
		active ? theme.colors.white : !disabled ? theme.colors.white : theme.colors.gray2}; //fixme
	padding: 8px 10px;
	box-sizing: border-box;
	margin: 0 -16px;
	white-space: nowrap;
	transition: 0.4s;

	:hover {
		background: ${({ theme, disabled }) => (!disabled ? theme.colors.gray3 : "transparent")};
	}
`;

const Wrap = styled.div<{ focused?: boolean }>`
	display: flex;
	flex-direction: column;
	width: 100%;

	.menu-arrow {
		transition: 0.4s;
		transform: ${({ focused }) => (focused ? "rotate(0deg)" : "rotate(180deg)")};
	}

	:hover {
		.menu-arrow {
			transform: ${({ focused }) => (focused ? "rotate(0)" : "rotate(90deg)")};
		}
	}
`;

const Select: React.FC<IProps> = ({ options, selected, onSelect, label, ...rest }) => {
	const [focused, setFocused] = useState(false);
	const theme = useTheme();
	return (
		<Tooltip
			config={{
				placement: "bottom-start",
				trigger: "click",
				onVisibleChange: setFocused,
			}}
			content={
				<Column crossAxisSize="max">
					{options.map((v) => {
						const active = selected?.key === v.key;
						return (
							<Option active={active} key={v.key + "_option"} onClick={() => onSelect(v)} disabled={v.disabled}>
								{v.title}
							</Option>
						);
					})}
				</Column>
			}
		>
			<Wrap focused={focused}>
				<Text >
					{label?.toUpperCase()}
				</Text>
				<SizedBox height={4} />
				<Root focused={focused} onClick={() => setFocused(true)} onBlur={() => setFocused(false)} {...rest}>
					{selected?.title ?? options[0]?.title}
					{/*<SizedBox width={10}/>*/}
					<img src={arrowIcon} className="menu-arrow" alt="arrow" />
				</Root>
			</Wrap>
		</Tooltip>
	);
};
export default Select;
