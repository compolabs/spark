import React from "react";
import { Route, Routes } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import Header from "@components/Header";
import Faucet from "@screens/Faucet/Faucet";
import TradeScreen from "@screens/TradeScreen";
import { ROUTES } from "@src/constants";

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
				<Route element={<TradeScreen />} path={ROUTES.TRADE} />
				<Route element={<TradeScreen />} path={ROUTES.ROOT} />
				<Route element={<Faucet />} path={ROUTES.FAUCET} />
			</Routes>
		</Root>
	);
});

export default App;
