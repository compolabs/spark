import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import BigNumberInput from "./BigNumberInput";
import AmountInput from "./AmountInput";
import _ from "lodash";
import Text, { TEXT_TYPES } from "@components/Text";
import SizedBox from "@components/SizedBox";
import { useTheme } from "@emotion/react";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import Chip from "@components/Chip";

interface IProps {
	assetId: string;
	setAssetId?: (assetId: string) => void;
	decimals: number;
	label?: string;
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
	padding: 8px;
	height: 32px;
	width: 100%;
	cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};

	box-sizing: border-box;

	input {
		cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
	}

	background: ${({ disabled, theme }) => (disabled ? theme.colors.gray2 : theme.colors.gray5)};

	border-radius: 4px;
	border: 1px solid
		${({ error, focused, disabled, theme }) =>
			(() => {
				if (disabled) return theme.colors.gray2;
				if (error) return theme.colors.error;
				if (focused) return theme.colors.gray1;
				return theme.colors.gray5;
			})()};
`;

const TokenInput: React.FC<IProps> = (props) => {
	const [focused, setFocused] = useState(false);
	const [amount, setAmount] = useState<BN>(props.amount);
	const theme = useTheme();
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
					<Text type={TEXT_TYPES.LABEL} color={theme.colors.gray2}>
						{props.label}
					</Text>
					<SizedBox height={4} />
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
				/>
				<Chip>{TOKENS_BY_ASSET_ID[props.assetId].symbol}</Chip>
			</InputContainer>
			<SizedBox height={2} />
			{props.error && (
				<>
					<SizedBox width={4} />
					<Text color={theme.colors.error} type={TEXT_TYPES.BODY_SMALL}>
						{props.errorMessage}
					</Text>
				</>
			)}
		</Root>
	);
};
export default observer(TokenInput);
