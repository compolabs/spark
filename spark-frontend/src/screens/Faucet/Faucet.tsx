import styled from "@emotion/styled";
import React, { useEffect } from "react";
import Text, { TEXT_TYPES } from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Observer } from "mobx-react-lite";
import { FaucetVMProvider, useFaucetVM } from "@screens/Faucet/FaucetVm";
import TokensFaucetTable from "@screens/Faucet/TokensFaucetTable";
import Skeleton from "react-loading-skeleton";

//https://www.figma.com/file/n2x2dfjwCzE4Wy70J3rzti/Spark-redesign?type=design&node-id=961-73266&mode=design&t=aHi9eUyuPRcmd4sZ-11

//todo
// 1 закомментить все красное
// перенести таблицу в отдельную папку и разрбораться че по таблицам
// имплементировать функцию мината токена в vm
// имплементировать добавление токена
// * сделать кнопку mint all

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
	useEffect(() => {
		document.title = `Spark | Faucet`;
	}, []);
	return (
		<Observer>
			{() => {
				return (
					<Root>
						<Text type={TEXT_TYPES.H} primary>
							Faucet for Fuel Network
						</Text>
						<SizedBox height={16} />
						{vm.faucetTokens.length === 0 ? <Skeleton height={48} style={{ margin: 4 }} count={4} /> : <TokensFaucetTable />}
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
