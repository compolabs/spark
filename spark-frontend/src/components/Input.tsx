import styled from "@emotion/styled";
import React, { ChangeEvent } from "react";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";

interface IProps
	extends Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "onChange"> {
	value?: string;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Root = styled.div`
	width: 100%;

	input {
		padding: 0;
		width: 100%;
		outline: none;
		border: none;
		background-color: transparent;

		color: ${({ theme }) => theme.colors.gray1};

		${TEXT_TYPES_MAP[TEXT_TYPES.NUMBER_MEDIUM]}
		::placeholder {
			color: ${({ theme }) => theme.colors.gray1};
		}
	}
`;

const Input: React.FC<IProps> = ({ value, onChange, placeholder, ...rest }) => {
	return (
		<>
			<Root {...rest}>
				<input onChange={onChange} value={value} placeholder={placeholder} />
			</Root>
		</>
	);
};
export default Input;
