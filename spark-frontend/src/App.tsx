import React from "react";
import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import { Route, Routes } from "react-router-dom";
import { observer } from "mobx-react";
import TradeScreen from "@screens/TradeScreen";
import Header from "@components/Header";
import UiKit from "@screens/UiKit";
import { ROUTES } from "@src/constants";
import design from "./design.png";
import Text, { TEXT_TYPES } from "@components/Text";
import SizedBox from "@components/SizedBox";

const Root = styled(Column)`
	width: 100%;
	min-width: 1080px;
	align-items: center;
	background: ${({ theme }) => theme.colors.gray5};
	height: 100vh;
	overflow-y: scroll;
`;

const App: React.FC = observer(() => {
	return (
		<Root>
			<Header />
			<Routes>
				<Route path={ROUTES.UI} element={<UiKit />} />
				<Route
					path={"/scale-demo"}
					element={
						<Column>
							<SizedBox height={16} />
							<Text type={TEXT_TYPES.H1}>This is a picture from a 1k1 scale design</Text>
							<SizedBox height={8} />
							<Text type={TEXT_TYPES.H3}>On this example you can see how the elements will look like</Text>
							<SizedBox height={16} />
							<img src={design} alt="test" style={{ width: 1280 }} />
						</Column>
					}
				/>
				<Route path="*" element={<TradeScreen />} />
				{/*<Route path={ROUTES.FAUCET} element={<Faucet />} />*/}
			</Routes>
		</Root>
	);
});

export default App;
