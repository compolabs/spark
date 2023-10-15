import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import centerEllipsis from "@src/utils/centerEllipsis";
import { Row } from "./Flex";
import { ReactComponent as Logo } from "@src/assets/icons/logo.svg";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import Button from "@components/Button";
import { ROUTES } from "@src/constants";
import { Link, useLocation } from "react-router-dom";
import isRoutesEquals from "@src/utils/isRoutesEquals";
import SizedBox from "@components/SizedBox";
import { ReactComponent as GearIcon } from "@src/assets/icons/gear.svg";
import { LOGIN_TYPE } from "@stores/AccountStore";

interface IProps {}

const Root = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 46px;
	padding: 0 16px;
	box-sizing: border-box;
	border: 1px solid white;

	* {
		text-decoration: none;
	}
`;

const Divider = styled.div`
	margin: 0 20px;
	width: 1px;
	height: 12px;
	background: ${({ theme }) => theme.colors.gray2};
`;

const MenuItem = styled.div<{ active?: boolean; disabled?: boolean }>`
	cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
	width: 100px;
	text-align: center;
	color: ${({ theme, active, disabled }) => (active && !disabled ? theme.colors.white : theme.colors.gray1)};
	position: relative;
	${TEXT_TYPES_MAP[TEXT_TYPES.H3]}
	transition: .4s;

	:hover {
		color: ${({ theme, disabled }) => (disabled ? theme.colors.gray1 : theme.colors.white)};
	}

	::after {
		transition: 0.4s;
		position: absolute;
		content: "";
		width: 100%;
		height: 2px;
		border-radius: 4px;
		background: ${({ theme, active }) => (active ? theme.colors.white : "transparent")};
		left: 0;
		right: 0;
		bottom: -16px;
	}
`;
type TMenuItem = {
	title: string;
	route?: string;
	link?: string;
};
const menuItems: Array<TMenuItem> = [
	{ title: "DASHBOARD" },
	{ title: "TRADE", route: ROUTES.ROOT },
	// {title: "EARN"},
	{ title: "FAUCET", link: "https://app.swaylend.com/#/faucet" },
	{ title: "UIKIT", route: ROUTES.UI },
	// {title: "DOCS",},
	{ title: "GITHUB", link: "https://github.com/compolabs/spark" }
	// {title: "MORE", route: ROUTES.ROOT},
];

const SettingsButton = styled(Button)`
	width: 32px;
	height: 32px;
	padding: 0;
`;

const Header: React.FC<IProps> = observer(() => {
	const { accountStore } = useStores();
	const location = useLocation();

	return (
		<Root>
			<Row alignItems="center">
				<a rel="noreferrer noopener" href="/">
					<Logo />
				</a>
				<Divider />
				{menuItems.map(({ title, link, route }, key) => {
					if (link == null && route == null)
						return (
							<MenuItem key={key} disabled>
								{title}
							</MenuItem>
						);
					else if (route != null)
						return (
							<Link to={route}>
								<MenuItem active={isRoutesEquals(route, location.pathname)} key={key}>
									{title}
								</MenuItem>
							</Link>
						);
					else if (link != null)
						return (
							<a rel="noopener noreferrer" target="_blank" href={link}>
								<MenuItem key={key}>{title}</MenuItem>
							</a>
						);
				})}
			</Row>
			<Row mainAxisSize="fit-content" alignItems="center" justifyContent="flex-end">
				<SizedBox width={10} />
				<SettingsButton outline>
					<GearIcon />
				</SettingsButton>
				<SizedBox width={10} />
				<Button style={{ height: 32 }} outline fitContent>
					DEPOSIT/WITHDRAW
				</Button>
				<SizedBox width={10} />
				<Button style={{ height: 32 }} outline fitContent>
					BRIDGE
				</Button>
				<SizedBox width={10} />
				{accountStore.address != null ? (
					<Button fitContent onClick={accountStore.disconnect}>
						Disconnect {centerEllipsis(accountStore.address, 8)}
					</Button>
				) : (
					<Button
						fitContent
						onClick={() =>
							accountStore.walletInstance == null
								? window.open("https://wallet.fuel.network/docs/install/")
								: accountStore.login(LOGIN_TYPE.FUEL_WALLET)
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
