import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import { ReactComponent as Logo } from "@src/assets/icons/logo.svg";
import Text, { TEXT_TYPES } from "@components/Text";
import Button from "@components/Button";
import { ROUTES } from "@src/constants";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SizedBox from "@components/SizedBox";
import { ReactComponent as GearIcon } from "@src/assets/icons/gear.svg";
import { DesktopRow, Row } from "@components/Flex";
import ConnectedWallet from "@components/Header/ConnectedWallet";
import isRoutesEquals from "@src/utils/isRoutesEquals";

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
const DesktopMenuItem = styled(Text)<{ active?: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px 4px;
	margin-right: 32px;
	cursor: pointer;
	color: ${({ theme, active }) => (active ? theme.colors.textPrimary : theme.colors.textSecondary)};
	border-bottom: 2px solid ${({ theme, active }) => (active ? theme.colors.textPrimary : "transparent")};
	transition: 0.4s;

	:hover {
		color: ${({ theme }) => theme.colors.textPrimary};
	}
`;

type TMenuItem = {
	title: string;
	route?: string;
	link?: string;
};
export const MENU_ITEMS: Array<TMenuItem> = [
	{ title: "TRADE", route: ROUTES.TRADE },
	{ title: "FAUCET", route: ROUTES.FAUCET },
	{ title: "DOCS", link: "https://docs.sprk.fi" },
	{ title: "GITHUB", link: "https://github.com/compolabs/spark" },
];

const SettingsButton = styled(Button)`
	width: 32px;
	height: 32px;
	border-radius: 32px;
	padding: 0 !important;

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
//todo add dropdown
const Header: React.FC<IProps> = observer(() => {
	const { accountStore } = useStores();
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<Root>
			<Row alignItems="center">
				<a rel="noreferrer noopener" href="/">
					<Logo />
				</a>
				<Divider />
				<DesktopRow>
					{MENU_ITEMS.map(({ title, link, route }, key) => {
						if (link == null && route == null)
							return (
								<DesktopMenuItem type={TEXT_TYPES.BUTTON_SECONDARY} key={key}>
									{title}
								</DesktopMenuItem>
							);
						else if (route != null)
							return (
								<Link to={route} key={key}>
									<DesktopMenuItem
										type={TEXT_TYPES.BUTTON_SECONDARY}
										key={key}
										active={isRoutesEquals(route, location.pathname)}
									>
										{title}
									</DesktopMenuItem>
								</Link>
							);
						else if (link != null)
							return (
								<a rel="noopener noreferrer" target="_blank" href={link} key={key}>
									<DesktopMenuItem type={TEXT_TYPES.BUTTON_SECONDARY} key={key}>
										{title}
									</DesktopMenuItem>
								</a>
							);
						else return null;
					})}
				</DesktopRow>
			</Row>
			<Row mainAxisSize="fit-content" alignItems="center" justifyContent="flex-end">
				<DesktopRow>
					{/*<SizedBox width={10} />*/}
					<SettingsButton disabled>
						<GearIcon />
					</SettingsButton>
					<SizedBox width={10} />
				</DesktopRow>
				{accountStore.address != null ? (
					<ConnectedWallet />
				) : (
					<Button
						green
						fitContent
						onClick={() =>
							accountStore.fuel == null ? window.open("https://wallet.fuel.network/docs/install/") : navigate(ROUTES.TRADE)
						}
					>
						Connect wallet
					</Button>
				)}
			</Row>
		</Root>
	);
});
export default Header;
