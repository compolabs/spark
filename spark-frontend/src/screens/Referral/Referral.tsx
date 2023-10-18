import styled from "@emotion/styled";
import React from "react";
import { ReferralVMProvider } from "@screens/Referral/ReferralVm";

interface IProps {}

const Root = styled.div``;

const ReferralImpl: React.FC<IProps> = () => {
	return <Root></Root>;
};

const Referral: React.FC<IProps> = () => (
	<ReferralVMProvider>
		<ReferralImpl />
	</ReferralVMProvider>
);
export default Referral;
