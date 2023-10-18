import styled from "@emotion/styled";
import React, { useState } from "react";
import Text, { TEXT_TYPES } from "@components/Text";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { observer } from "mobx-react";
import Input from "@components/Input";
import { Column } from "@components/Flex";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@src/constants";
import { useReferralVM } from "@screens/Referral/ReferralVm";

interface IProps {}

const StyledInput = styled(Input)`
	display: flex;
	align-items: center;
	height: 32px;

	& > input {
		color: ${({ theme }) => theme.colors.white};
	}

	background: ${({ theme }) => theme.colors.gray5};
	border-radius: 4px;
	padding: 0 10px;
	box-sizing: border-box;
	transition: 0.4s;
	border: 1px solid transparent;

	:hover {
		border-color: ${({ theme }) => theme.colors.white};
	}
`;

const ReferralInterface: React.FC<IProps> = observer(() => {
	const vm = useReferralVM();
	const [address, setAddress] = useState("");
	//todo add verification of fuel address
	return (
		<>
			<Text type={TEXT_TYPES.H1}>Spark Referral Program</Text>
			<SizedBox height={8} />
			<Text type={TEXT_TYPES.BODY_MEDIUM}>
				Unlock Early Access & Multiply Benefits! Connect your wallet to check early user status and share your referral
				link. As a Level 0 user, invite 3 friends, who invite 2, and so on. Help Spark grow – limited referral links
				available!
			</Text>
			<SizedBox height={40} />
			<Column crossAxisSize="max">
				<Text type={TEXT_TYPES.LABEL}>Referral address</Text>
				<SizedBox height={4} />
				<StyledInput value={address} onChange={(e) => setAddress(e.target.value)} />
			</Column>

			<SizedBox height={40} />
			<Button primary onClick={() => vm.registerUser(address)} disabled={address.length < 63 || vm.loading}>
				{vm.loading ? "Loading..." : "Join Spark"}
			</Button>
		</>
	);
});
export default ReferralInterface;
