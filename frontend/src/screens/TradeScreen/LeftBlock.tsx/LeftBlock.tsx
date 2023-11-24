import styled from "@emotion/styled";
import React, { ComponentProps } from "react";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import MarketSelection from "./MarketSelection";
import CreateOrderSpot from "./CreateOrderSpot";
import CreateOrderPerp from "./CreateOrderPerp";

interface IProps extends ComponentProps<any> {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	flex: 2;
	max-width: 280px;
	height: 100%;
	border-radius: 10px;
	background: ${({ theme }) => theme.colors.bgSecondary};
`;

const LeftBlock: React.FC<IProps> = observer(({ ...rest }) => {
	const { settingsStore } = useStores();
	return (
		<Root {...rest}>
			{settingsStore.marketSelectionOpened ? (
				<MarketSelection />
			) : settingsStore.isCurrentMarketPerp ? (
				<CreateOrderPerp />
			) : (
				<CreateOrderSpot />
			)}
		</Root>
	);
});
export default LeftBlock;
