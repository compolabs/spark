import styled from "@emotion/styled";
import React from "react";
import Text, { TEXT_TYPES } from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Observer } from "mobx-react-lite";
import { FaucetVMProvider, useFaucetVM } from "@screens/Faucet/FaucetVm";
import TokensFaucetTable from "@screens/Faucet/TokensFaucetTable";
import Skeleton from "react-loading-skeleton";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	padding: 0 16px;
	width: 100%;
	min-height: 100%;
	margin-bottom: 24px;
	margin-top: 40px;
	text-align: left;

	@media (min-width: 880px) {
		margin-top: 56px;
	}
`;

const FaucetImpl: React.FC<IProps> = () => {
	const vm = useFaucetVM();
	return (
		<Observer>
			{() => {
				return (
					<Root>
						<Text type={TEXT_TYPES.H} primary>
							Faucet for Fuel Network
						</Text>
						<SizedBox height={16} />
						{vm.faucetTokens.length === 0 ? <Skeleton height={70} style={{ margin: 4 }} count={5} /> : <TokensFaucetTable />}
					</Root>
				);
			}}
		</Observer>
	);
};

const Faucet: React.FC<IProps> = () => (
	<FaucetVMProvider>
		<FaucetImpl />
	</FaucetVMProvider>
);
export default Faucet;
