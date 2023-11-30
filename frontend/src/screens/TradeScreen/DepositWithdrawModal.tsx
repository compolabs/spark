import React, { useState } from "react";
import Dialog from "@components/Dialog";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";
import { observer } from "mobx-react-lite";
import { Column, Row } from "@components/Flex";
import { useStores } from "@stores";
import styled from "@emotion/styled";
import Button, { ButtonGroup } from "@components/Button";
import SizedBox from "@components/SizedBox";
import TokenInput from "@components/TokenInput";
import BN from "@src/utils/BN";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import MaxButton from "@src/components/MaxButton";
import Text, { TEXT_TYPES } from "@components/Text";

export interface IProps extends IDialogPropTypes {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	width: 100%;
	padding: 12px;
`;
const DepositWithdrawModal: React.FC<IProps> = ({ children, ...rest }) => {
	const { tradeStore, accountStore } = useStores();
	const [isWithdraw, setIsWithdraw] = useState(true);
	const [depositAmount, setDepositAmount] = useState(BN.ZERO);
	const [withdrawAmount, setWithdrawAmount] = useState(BN.ZERO);
	const usdcBalance = accountStore.getBalance(TOKENS_BY_SYMBOL.USDC) ?? BN.ZERO;
	const usdcBalanceFormat = BN.formatUnits(usdcBalance, TOKENS_BY_SYMBOL.USDC.decimals);
	const freeCollateralFormat = BN.formatUnits(tradeStore.freeCollateral ?? 0, TOKENS_BY_SYMBOL.USDC.decimals);
	return (
		<Dialog {...rest} style={{ maxWidth: 390 }} >
			<Column crossAxisSize="max" style={{ maxHeight: 360 }}>
				<Root>
					<ButtonGroup style={{ padding: "0 12px" }}>
						<Button active={isWithdraw} onClick={() => setIsWithdraw(true)}>
							Withdraw
						</Button>
						<Button active={!isWithdraw} onClick={() => setIsWithdraw(false)}>
							Deposit
						</Button>
					</ButtonGroup>
					<SizedBox height={12} />
					<TokenInput
						decimals={TOKENS_BY_SYMBOL.USDC.decimals}
						amount={isWithdraw ? withdrawAmount : depositAmount}
						setAmount={(v) => (isWithdraw ? setWithdrawAmount(v) : setDepositAmount(v))}
						label="Amount"
					/>
					<SizedBox height={4} />
					<Row alignItems="center" justifyContent="space-between">
						<Text type={TEXT_TYPES.SUPPORTING}>{isWithdraw ? "Available to withdraw" : "Wallet balance"}</Text>
						<Row alignItems="center" mainAxisSize="fit-content">
							<Text type={TEXT_TYPES.SUPPORTING}>
								{isWithdraw ? `${freeCollateralFormat.toFormat(2)} USDC` : `${usdcBalanceFormat.toFormat(2)} USDC`}
							</Text>
							<SizedBox width={4} />
							<MaxButton fitContent onClick={() => (isWithdraw ? {} : setDepositAmount(usdcBalance))}>
								MAX
							</MaxButton>
						</Row>
					</Row>
					<SizedBox height={52} />
					<Button onClick={() => (isWithdraw ? tradeStore.withdraw() : tradeStore.deposit(depositAmount))}>
						{isWithdraw ? "Withdraw" : "Deposit"}
					</Button>
				</Root>
			</Column>
		</Dialog>
	);
};
export default observer(DepositWithdrawModal);
