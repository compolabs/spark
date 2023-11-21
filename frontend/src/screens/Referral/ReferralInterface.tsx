import styled from "@emotion/styled";
import React, { useState } from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { observer } from "mobx-react";
import Input from "@components/Input";
import { Column } from "@components/Flex";
import { useStores } from "@stores";
import { useLocation } from "react-router-dom";

interface IProps {}

const StyledInput = styled(Input)`
	display: flex;
	align-items: center;
	height: 32px;

	& > input {
		color: ${({ theme }) => theme.colors.textPrimary};
	}

	background: ${({ theme }) => theme.colors.bgSecondary};
	border-radius: 4px;
	padding: 0 10px;
	box-sizing: border-box;
	transition: 0.4s;
	border: 1px solid transparent;

	:hover {
		border-color: ${({ theme }) => theme.colors.textPrimary};
	}
`;

const ReferralInterface: React.FC<IProps> = observer(() => {
	const { referralStore } = useStores();
	const location = useLocation();
	const ref = new URLSearchParams(location.search).get("ref");
	const [address, setAddress] = useState(ref ?? "");
	//todo add verification of fuel address
	return (
		<>
			<Text>Spark Referral Program</Text>
			<SizedBox height={8} />
			<Text>
				Unlock Early Access & Multiply Benefits! Connect your wallet to check early user status and share your referral
				link. As a Level 0 user, invite 3 friends, who invite 2, and so on. Help Spark grow – limited referral links
				available!
			</Text>
			<SizedBox height={40} />
			<Column crossAxisSize="max">
				<Text>Referral address</Text>
				<SizedBox height={4} />
				<StyledInput value={address} onChange={(e) => setAddress(e.target.value)} />
			</Column>

			<SizedBox height={40} />
			<Button
				green
				onClick={() => referralStore.registerUser(address)}
				disabled={address.length < 63 || referralStore.loading}
			>
				{referralStore.loading ? "Loading..." : "Join Spark"}
			</Button>
		</>
	);
});
export default ReferralInterface;
