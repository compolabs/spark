import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button from "@components/Button";
import SizedBox from "@components/SizedBox";
import bg from "@src/assets/referralBackground.png";
import { Column } from "@src/components/Flex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@src/components/Text";
import { useStores } from "@stores";
import { LOGIN_TYPE } from "@stores/AccountStore";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	height: 100%;
	flex: 1;
	box-sizing: border-box;
	padding: 0 4px;
`;

const Image = styled.div`
	flex: 2;
	background: url(${bg}) center no-repeat;
	background-size: cover;
	display: none;
	border-radius: 4px;
	@media (min-width: 880px) {
		width: 100%;
		height: 100%;
		display: flex;
	}
`;

const Body = styled(Column)`
	align-items: center;
	justify-content: center;
	flex: 3;
	height: 100%;
	background: ${({ theme }) => theme.colors.bgSecondary};
	border-radius: 4px;
`;

export const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.greenLight};
  cursor: pointer;
  transition: .4s;
  text-decoration: none;
  ${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]};

  :hover {
    opacity: .8;
  }

}
`;

const wallets = [
	{ name: "Metamask", active: true, type: LOGIN_TYPE.METAMASK },
	{ name: "Ledger", active: false },
	{
		name: "Fuel Wallet",
		// type: LOGIN_TYPE.FUEL_WALLET,
		// active: accountStore.listConnectors.includes(LOGIN_TYPE.FUEL_WALLET),
		active: false,
	},
	{
		name: "Fuelet",
		// type: LOGIN_TYPE.FUELET,
		// active: accountStore.listConnectors.includes(LOGIN_TYPE.FUELET),
		active: false,
	},
	{
		name: "Fuel Wallet Dev",
		// type: LOGIN_TYPE.FUEL_DEV,
		// active: accountStore.listConnectors.includes(LOGIN_TYPE.FUEL_DEV),
		active: false,
	},
	{
		name: "Create account",
		// type: LOGIN_TYPE.GENERATE_SEED,
		// active: true
		active: false,
	},
];

// todo этот компонент в старом дизайне, надо сделать в новом https://www.figma.com/file/n2x2dfjwCzE4Wy70J3rzti/Spark-redesign?type=design&node-id=50-4027&mode=design&t=IwyRKFW5pCeNNCX8-4
const ConnectWallet: React.FC<IProps> = observer(() => {
	const { accountStore, tradeStore } = useStores();
	const navigate = useNavigate();
	return (
		<Root>
			<Image />
			<SizedBox width={4} />
			<Body>
				<Column alignItems="center" crossAxisSize="max" justifyContent="center" style={{ maxWidth: 360 }}>
					{wallets.map(({ name, active }) => (
						<Button
							key={name}
							disabled={!active}
							style={{ marginBottom: 16 }}
							onClick={() => {
								active && accountStore.connectWallet();
								navigate(`/${tradeStore.defaultMarketSymbol}`);
							}}
						>
							{name}
						</Button>
					))}
					<SizedBox height={40} />
					<Text>New to Fuel blockchain?</Text>
					<SizedBox height={4} />
					<StyledLink
						href="https://stalkerairdrop.medium.com/fuel-testnet-swaylend-db9ce8d10cb4#f93f"
						rel="noopener noreferrer"
						target="_blank"
					>
						Learn more about wallets
					</StyledLink>
				</Column>
			</Body>
		</Root>
	);
});

export default ConnectWallet;
