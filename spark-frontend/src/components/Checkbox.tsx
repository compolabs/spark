import React from "react";
import styled from "@emotion/styled";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
	checked: boolean;
}

export const Checkbox: React.FC<Props> = ({ checked, children, ...props }) => {
	return (
		<Root>
			<HiddenCheckbox checked={checked} type="checkbox" {...props} />
			<StyledCheckbox checked={checked}>
				<CheckedIcon height="12" viewBox="0 0 12 12" width="12" xmlns="http://www.w3.org/2000/svg">
					<path
						clipRule="evenodd"
						d="M2 0C0.895431 0 0 0.895431 0 2V10C0 11.1046 0.895431 12 2 12H10C11.1046 12 12 11.1046 12 10V2C12 0.895431 11.1046 0 10 0H2ZM2 5.40673L3.18626 4.82915L5.42857 8.33229L8.78481 2.5L10 3.07758L6.16637 9.5H4.69078L2 5.40673Z"
						fill="#00E388"
						fillRule="evenodd"
					/>
				</CheckedIcon>
			</StyledCheckbox>
			{children}
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

const CheckedIcon = styled.svg`
	fill: none;
`;

const HiddenCheckbox = styled.input`
	appearance: none;
`;

const StyledCheckbox = styled.div<{ checked: boolean }>`
	display: flex;
	width: 12px;
	height: 12px;
	border-radius: 4px;
	border: 1px solid ${({ checked, theme }) => (checked ? theme.colors.greenLight : theme.colors.iconSecondary)};

	${CheckedIcon} {
		visibility: ${({ checked }) => (checked ? "visible" : "hidden")};
	}
`;
