import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";

interface IProps {
  onClose: () => void;
  opened: boolean;
}

const Root = styled.div<{ opened: boolean }>`
  z-index: 100;
  background: ${({ theme }) => `${theme.colors.bgPrimary}`};
  position: absolute;
  top: 48px;
  left: 0;
  right: 0;
  height: calc(100vh - 64px);
  transition: 0.2s;
  overflow: hidden;

  ${({ opened }) => !opened && `height: 0px;`};
  box-sizing: border-box;
  padding: 0 4px;
`;

const Body = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

const MenuItem = styled.div<{ selected?: boolean }>`
  cursor: pointer;
  ${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON_SECONDARY]};
  color: ${({ theme, selected }) => (selected ? theme.colors.redLight : theme.colors.textSecondary)};
  padding: 12px 32px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => `${theme.colors.bgSecondary}`};
  border-radius: 10px;
`;
const MobileMenu: React.FC<IProps> = ({ opened, onClose }) => null;
// const MobileMenu: React.FC<IProps> = ({ opened, onClose }) => {
// 	const { settingsStore, accountStore } = useStores();
// 	const navigate = useNavigate();
// 	const location = useLocation();
// 	const theme = useTheme();
//
// 	const menuItems = [
// 		{
// 			name: "TRADE SPOT",
// 			link: `/BTC-USDC`,
// 		},
// 		{
// 			name: "TRADE PERP",
// 			link: "/BTC-PERP",
// 		},
// 		{
// 			name: "FAUCET",
// 			link: ROUTES.FAUCET,
// 		},
// 		{
// 			name: "DOCS",
// 			link: "https://docs.sprk.fi/",
// 		},
// 	];
// 	return (
// 		<Root {...{ opened }}>
// 			<Body>
// 				<Container>
// 					<SizedBox height={8} />
// 					{menuItems.map(({ name, link }) => (
// 						<MenuItem
// 							key={name}
// 							selected={isRoutesEquals(link, location.pathname)}
// 							onClick={() => {
// 								navigate(link);
// 								onClose();
// 							}}
// 						>
// 							<Text color={isRoutesEquals(link, location.pathname) ? theme.colors.textPrimary : theme.colors.textSecondary}>
// 								{name}
// 							</Text>
// 						</MenuItem>
// 					))}
// 					<SizedBox height={92} />
// 				</Container>
// 				<SizedBox height={8} />
//
// 				{accountStore.address != null ? (
// 					<>
// 						<Button color="primary" onClick={() => settingsStore.setDepositModal(true)}>
// 							Deposit / Withdraw
// 						</Button>
// 						<SizedBox height={4} />
// 						<ConnectedWallet />
// 					</>
// 				) : (
// 					<Button
// 						green
// 						onClick={() => {
// 							navigate(ROUTES.CONNECT);
// 							onClose();
// 						}}
// 					>
// 						Connect wallet
// 					</Button>
// 				)}
// 			</Body>
// 		</Root>
// 	);
// };
export default observer(MobileMenu);
