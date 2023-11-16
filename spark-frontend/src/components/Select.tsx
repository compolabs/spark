import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import Tooltip from "./Tooltip";
import arrowIcon from "@src/assets/icons/arrowUp.svg";
import SizedBox from "@components/SizedBox";
import { Column } from "./Flex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "./Text";

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

const Root = styled.div<{
	focused?: boolean;
	disabled?: boolean;
}>`
  display: flex;
  height: 32px;
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border: 1px solid ${({ focused, theme }) => (focused ? theme.colors.borderAccent : theme.colors.borderSecondary)};
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
  color: ${({ theme, disabled }) => (!disabled ? theme.colors.textPrimary : theme.colors.textDisabled)};
  cursor: ${({ disabled }) => (!disabled ? "pointer" : "not-allowed")};
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
}
`;
export const Option = styled.div<{
	active?: boolean;
	disabled?: boolean;
}>`
	width: 100%;
	display: flex;
	cursor: ${({ disabled }) => (!disabled ? "pointer" : "not-allowed")};
	align-items: center;
	background: ${({ active, theme }) => (active ? theme.colors.borderPrimary : "transparent")};
	color: ${({ disabled, theme }) => (disabled ? theme.colors.textDisabled : theme.colors.textPrimary)};
	padding: 8px 10px;
	box-sizing: border-box;
	white-space: nowrap;
	transition: 0.4s;

	:hover {
		background: ${({ theme, active, disabled }) =>
			active ? theme.colors.borderPrimary : disabled ? "transparent" : theme.colors.borderSecondary};
	}

	:active {
		background: ${({ theme, disabled }) => (!disabled ? theme.colors.borderPrimary : "transparent")};
	}

	${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON_SECONDARY]};
`;

const Wrap = styled.div<{
	focused?: boolean;
	disabled?: boolean;
}>`
	display: flex;
	flex-direction: column;
	width: 100%;

	.menu-arrow {
		transition: 0.4s;
		transform: ${({ focused }) => (focused ? "rotate(-180deg)" : "rotate(0deg)")};
	}

	:hover {
		.menu-arrow {
			transform: ${({ focused, disabled }) => (focused ? "rotate(-180)" : disabled ? "rotate(0deg)" : "rotate(-90deg)")};
		}
	}
`;

const Select: React.FC<IProps> = ({ options, selected, onSelect, label, ...rest }) => {
	const [focused, setFocused] = useState(false);
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
				<Text>{label}</Text>
				<SizedBox height={2} />
				<Root onClick={() => setFocused(true)} onBlur={() => setFocused(false)} {...rest}>
					{selected?.title ?? options[0]?.title}
					{/*<SizedBox width={10}/>*/}
					<img src={arrowIcon} className="menu-arrow" alt="arrow" />
				</Root>
			</Wrap>
		</Tooltip>
	);
};
export default Select;
