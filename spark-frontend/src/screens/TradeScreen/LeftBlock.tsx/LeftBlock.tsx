import styled from "@emotion/styled";
import React, { ComponentProps } from "react";
import { observer } from "mobx-react";
import CreateOrderSpot from "./CreateOrderSpot";
import MarketSelection from "@screens/TradeScreen/LeftBlock.tsx/MarketSelection";
import { useStores } from "@stores";

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
	const { tradeStore } = useStores();
	return <Root {...rest}>{tradeStore.marketSelectionOpened ? <MarketSelection /> : <CreateOrderSpot />}</Root>;
});
export default LeftBlock;
