import styled from "@emotion/styled";
import React, { useState } from "react";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import { ReactComponent as Logo } from "@src/assets/icons/logoColoredFalse.svg";
import { TEXT_TYPES } from "@components/Text";
import Button from "@components/Button";
import { ROUTES } from "@src/constants";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SizedBox from "@components/SizedBox";
import { DesktopRow, MobileRow, Row } from "@components/Flex";
import ConnectedWallet from "@components/Header/ConnectedWallet";
import isRoutesEquals from "@src/utils/isRoutesEquals";
import Tab from "@components/Tab";
import DepositWithdrawModal from "@screens/TradeScreen/DepositWithdrawModal";
import MobileMenu from "./MobileMenu";
import MobileMenuIcon from "./MobileMenuIcon";

interface IProps {}

const Root = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 48px;
	padding: 0 12px;
	box-sizing: border-box;
	flex-shrink: 0;

	* {
		text-decoration: none;
	}
`;

const Divider = styled.div`
	margin: 0 16px;
	width: 1px;
	height: 32px;
	background: ${({ theme }) => theme.colors.bgSecondary};
`;

type TMenuItem = {
	title: string;
	route?: string;
	link?: string;
};

const TabContainer = styled(DesktopRow)`
	& > * {
		margin-right: 28px;
	}
`;
export const MENU_ITEMS: Array<TMenuItem> = [
	{ title: "TRADE", route: ROUTES.ROOT },
	{ title: "FAUCET", route: ROUTES.FAUCET },
	{ title: "DOCS", link: "https://docs.sprk.fi" },
	{ title: "GITHUB", link: "https://github.com/compolabs/spark" },
];

const SettingsButton = styled(Button)`
	border-radius: 32px;
	padding: 2px 4px;

	path {
		fill: ${({ theme }) => theme.colors.iconSecondary};
	}

	:active {
		path {
			fill: ${({ theme }) => theme.colors.iconPrimary};
		}
	}

	:disabled {
		path {
			fill: ${({ theme }) => theme.colors.iconDisabled};
		}
	}
`;
const Header: React.FC<IProps> = observer(() => {
	const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
	const { accountStore, settingsStore } = useStores();
	const location = useLocation();
	const navigate = useNavigate();
	const toggleMenu = (state: boolean) => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		document.body.classList.toggle("noscroll", state);
		setMobileMenuOpened(state);
	};
	return (
		<Root>
			<Row alignItems="center">
				<a rel="noreferrer noopener" href="/">
					<Logo />
				</a>
				<Divider />
				<TabContainer>
					{MENU_ITEMS.map(({ title, link, route }) => {
						if (link == null && route == null)
							return (
								<Tab type={TEXT_TYPES.BUTTON_SECONDARY} key={title}>
									{title}
								</Tab>
							);
						else if (route != null)
							return (
								<Link to={route} key={title}>
									<Tab type={TEXT_TYPES.BUTTON_SECONDARY} key={title} active={isRoutesEquals(route, location.pathname)}>
										{title}
									</Tab>
								</Link>
							);
						else if (link != null)
							return (
								<a rel="noopener noreferrer" target="_blank" href={link} key={title}>
									<Tab type={TEXT_TYPES.BUTTON_SECONDARY} key={title}>
										{title}
									</Tab>
								</a>
							);
						else return null;
					})}
				</TabContainer>
			</Row>
			<Row mainAxisSize="fit-content" alignItems="center" justifyContent="flex-end">
				<DesktopRow>
					{accountStore.address != null && (
						<>
							<SettingsButton onClick={() => settingsStore.setDepositModal(true)}>Deposit/Withdraw</SettingsButton>
							<SizedBox width={10} />
						</>
					)}
				</DesktopRow>
				{!mobileMenuOpened && <SizedBox width={16} />}
				{!mobileMenuOpened ? (
					accountStore.address != null ? (
						<ConnectedWallet />
					) : (
						<Button green fitContent onClick={() => navigate(ROUTES.CONNECT)}>
							Connect wallet
						</Button>
					)
				) : (
					<></>
				)}
				<MobileRow>
					<SizedBox width={8} />
					<MobileMenuIcon onClick={() => toggleMenu(!mobileMenuOpened)} opened={mobileMenuOpened} />
				</MobileRow>
			</Row>
			<DepositWithdrawModal
				visible={settingsStore.depositModalOpened}
				onClose={() => settingsStore.setDepositModal(false)}
			/>
			<MobileMenu opened={mobileMenuOpened} onClose={() => toggleMenu(false)} />
		</Root>
	);
});
export default Header;
