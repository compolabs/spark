import React from "react";
import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import { observer } from "mobx-react";
import Header from "@components/Header";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "@src/constants";
import TradeScreen from "@screens/TradeScreen";
import Faucet from "@screens/Faucet";
import ConnectWallet from "@screens/ConnectWallet";

const Root = styled(Column)`
	width: 100%;
	align-items: center;
	background: ${({ theme }) => theme.colors.bgPrimary};
	height: 100vh;
	max-height: 100vh;
`;

const App: React.FC = observer(() => {
	return (
		<Root>
			<Header />
			<Routes>
				<Route path={ROUTES.CONNECT} element={<ConnectWallet />} />
				<Route path={ROUTES.TRADE} element={<TradeScreen />} />
				<Route path={ROUTES.ROOT} element={<TradeScreen />} />
				<Route path={ROUTES.FAUCET} element={<Faucet />} />
			</Routes>
		</Root>
	);
});

export default App;
