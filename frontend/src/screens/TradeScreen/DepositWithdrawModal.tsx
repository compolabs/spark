import React, { useState } from "react";
import Dialog from "@components/Dialog";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";
import { observer } from "mobx-react-lite";
import { Row } from "@components/Flex";
import { useStores } from "@stores";
import styled from "@emotion/styled";
import Button, { ButtonGroup } from "@components/Button";
import SizedBox from "@components/SizedBox";
import TokenInput from "@components/TokenInput";
import BN from "@src/utils/BN";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import MaxButton from "@src/components/MaxButton";
import Text, { TEXT_TYPES } from "@components/Text";
import arrow from "@src/assets/icons/arrowUp.svg";
import Select from "@components/Select";

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

const tokens = [{ title: "USDC", key: "usdc" }];
const DepositWithdrawModal: React.FC<IProps> = ({ children, ...rest }) => {
	const { tradeStore, accountStore } = useStores();
	const [isDeposit, setIsDeposit] = useState(true);
	const [depositAmount, setDepositAmount] = useState(BN.ZERO);
	const [withdrawAmount, setWithdrawAmount] = useState(BN.ZERO);
	const usdcBalance = accountStore.getBalance(TOKENS_BY_SYMBOL.USDC) ?? BN.ZERO;
	const usdcBalanceFormat = BN.formatUnits(usdcBalance, TOKENS_BY_SYMBOL.USDC.decimals);
	const freeCollateralFormat = BN.formatUnits(tradeStore.freeCollateral ?? 0, TOKENS_BY_SYMBOL.USDC.decimals);
	const canDeposit = depositAmount.gt(0) && depositAmount.lte(usdcBalance) && !tradeStore.loading;
	const canWithdraw = withdrawAmount.gt(0) && tradeStore.freeCollateral?.lte(withdrawAmount) && !tradeStore.loading;

	return (
		<Dialog
			{...rest}
			title={
				<Row>
					<img src={arrow} alt="arrow-back" style={{ cursor: "pointer", rotate: "90deg" }} onClick={rest?.onClose} />
					<SizedBox width={10} />
					<Text type={TEXT_TYPES.H} color="primary">
						Deposit / Withdraw
					</Text>
				</Row>
			}
		>
			<Root>
				<ButtonGroup>
					<Button active={isDeposit} onClick={() => setIsDeposit(true)}>
						Deposit
					</Button>
					<Button active={!isDeposit} onClick={() => setIsDeposit(false)}>
						Withdraw
					</Button>
				</ButtonGroup>
				<SizedBox height={12} />
				<Row>
					<Select label="Asset" options={tokens} onSelect={() => {}} />
					<SizedBox width={8} />
					<TokenInput
						decimals={TOKENS_BY_SYMBOL.USDC.decimals}
						amount={isDeposit ? depositAmount : withdrawAmount}
						setAmount={(v) => (isDeposit ? setDepositAmount(v) : setWithdrawAmount(v))}
						label="Amount"
					/>
				</Row>
				<SizedBox height={4} />
				<Row alignItems="center" justifyContent="space-between">
					<Text type={TEXT_TYPES.SUPPORTING}>{isDeposit ? "Wallet balance" : "Available to withdraw"}</Text>
					<Row alignItems="center" mainAxisSize="fit-content">
						<Text type={TEXT_TYPES.SUPPORTING}>
							{isDeposit ? `${usdcBalanceFormat.toFormat(2)} USDC` : `${freeCollateralFormat.toFormat(2)} USDC`}
						</Text>
						<SizedBox width={4} />
						<MaxButton
							fitContent
							onClick={() =>
								isDeposit ? setDepositAmount(usdcBalance) : setWithdrawAmount(tradeStore.freeCollateral ?? BN.ZERO)
							}
						>
							MAX
						</MaxButton>
					</Row>
				</Row>
				<SizedBox height={52} />
				<Button
					onClick={async () => {
						isDeposit ? await tradeStore.deposit(depositAmount) : await tradeStore.withdraw(withdrawAmount);
						rest.onClose != null && rest.onClose({} as any);
					}}
					disabled={!(isDeposit ? canDeposit : canWithdraw)}
				>
					{tradeStore.loading ? "Loading..." : isDeposit ? "Deposit" : "Withdraw"}
				</Button>
			</Root>
		</Dialog>
	);
};
export default observer(DepositWithdrawModal);
