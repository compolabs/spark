import React from "react";
import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import { observer } from "mobx-react";
import Header from "@components/Header";
import { Route, Routes } from "react-router-dom";
import { ROUTES } from "@src/constants";
import Referral from "@screens/Referral";
import TradeScreen from "@screens/TradeScreen";
import Faucet from "@screens/Faucet";

const Root = styled(Column)`
	width: 100%;
	//min-width: 1080px;
	align-items: center;
	// background: ${({ theme }) => theme.colors.bgPrimary};
	height: 100vh;
	max-height: 100vh;
`;

const App: React.FC = observer(() => {
	return (
		<Root>
			<Header />
			<Routes>
				<Route path={ROUTES.REFERRAL} element={<Referral />} />
				<Route path={ROUTES.TRADE} element={<TradeScreen />} />
				<Route path={ROUTES.FAUCET} element={<Faucet />} />
				{/*<Route path="*" element={<Redirect/>} />*/}
			</Routes>
		</Root>
	);
});

export default App;
