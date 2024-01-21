import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import BigNumberInput from "./BigNumberInput";
import AmountInput from "./AmountInput";
import _ from "lodash";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import SizedBox from "@components/SizedBox";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import Chip from "@components/Chip";

interface IProps {
	assetId?: string;
	decimals: number;
	label?: string;
	max?: BN;
	amount: BN;
	setAmount?: (amount: BN) => void;
	errorMessage?: string;
	error?: boolean;
	disabled?: boolean;
}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
`;

const InputContainer = styled.div<{
	focused?: boolean;
	invalid?: boolean;
	readOnly?: boolean;
	error?: boolean;
	disabled?: boolean;
}>`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	padding: 0 8px;
	height: 32px;
	width: 100%;
	cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};

	box-sizing: border-box;

	input {
		cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
		${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
	}

	background: ${({ theme }) => theme.colors.bgPrimary};

	border-radius: 4px;
	border: 1px solid
		${({ error, focused, disabled, theme }) =>
			(() => {
				if (disabled) return theme.colors.borderSecondary;
				if (error) return theme.colors.attention;
				if (focused) return theme.colors.borderAccent;
				return theme.colors.borderSecondary;
			})()};
`;

const TokenInput: React.FC<IProps> = (props) => {
	const [focused, setFocused] = useState(false);
	const [amount, setAmount] = useState<BN>(props.amount);
	useEffect(() => {
		props.amount && setAmount(props.amount);
	}, [props.amount]);

	const handleChangeAmount = (v: BN) => {
		if (props.disabled) return;
		setAmount(v);
		debounce(v);
	};
	//eslint-disable-next-line react-hooks/exhaustive-deps
	const debounce = useCallback(
		_.debounce((value: BN) => {
			props.setAmount && props.setAmount(value);
		}, 500),
		[],
	);

	return (
		<Root>
			{props.label != null && (
				<>
					<Text>{props.label}</Text>
					<SizedBox height={2} />
				</>
			)}
			<InputContainer focused={focused} readOnly={!props.setAmount} error={props.error}>
				<BigNumberInput
					renderInput={(props, ref) => (
						<AmountInput
							{...props}
							onFocus={(e) => {
								props.onFocus && props.onFocus(e);
								!props.readOnly && setFocused(true);
							}}
							onBlur={(e) => {
								props.onBlur && props.onBlur(e);
								setFocused(false);
							}}
							disabled={props.disabled}
							ref={ref}
						/>
					)}
					autofocus={focused}
					decimals={props.decimals}
					value={amount}
					onChange={handleChangeAmount}
					placeholder="0.00"
					readOnly={!props.setAmount}
					disabled={props.disabled}
					max={props.max?.toString()}
				/>
				{props.assetId && <Chip>{TOKENS_BY_ASSET_ID[props.assetId].symbol}</Chip>}
			</InputContainer>
			<SizedBox height={2} />
			{props.error && (
				<>
					<SizedBox width={4} />
					<Text>{props.errorMessage}</Text>
				</>
			)}
		</Root>
	);
};
export default observer(TokenInput);
