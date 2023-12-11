import styled from "@emotion/styled";
import React from "react";
import { Column } from "@src/components/Flex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import bg from "@src/assets/referralBackground.png";
import { useStores } from "@stores";
import { observer } from "mobx-react";
import { LOGIN_TYPE } from "@stores/AccountStore";
import Button from "@components/Button";
import { useNavigate } from "react-router-dom";

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
const ConnectWallet: React.FC<IProps> = observer(() => {
	const { accountStore, tradeStore } = useStores();
	const navigate = useNavigate();
	const wallets = [
		{
			name: "Fuel Wallet",
			type: LOGIN_TYPE.FUEL_WALLET,
			active: accountStore.listConnectors.includes(LOGIN_TYPE.FUEL_WALLET),
		},
		{
			name: "Fuelet",
			type: LOGIN_TYPE.FUELET,
			active: accountStore.listConnectors.includes(LOGIN_TYPE.FUELET),
		},
		{ name: "Create account", type: LOGIN_TYPE.GENERATE_SEED, active: true },
		{
			name: "Fuel Wallet Dev",
			type: LOGIN_TYPE.FUEL_DEV,
			active: accountStore.listConnectors.includes(LOGIN_TYPE.FUEL_DEV),
		},
		{ name: "Metamask", active: false },
		{ name: "Ledger", active: false },
	];
	return (
		<Root>
			<Image />
			<SizedBox width={4} />
			<Body>
				<Column justifyContent="center" alignItems="center" crossAxisSize="max" style={{ maxWidth: 360 }}>
					{wallets.map(({ name, active, type }) => (
						<Button
							key={name}
							style={{ marginBottom: 16 }}
							onClick={() => {
								active && type && accountStore.login(type);
								navigate(`/${tradeStore.defaultMarketSymbol}`);
							}}
							disabled={!active}
						>
							{name}
						</Button>
					))}
					<SizedBox height={40} />
					<Text>New to Fuel blockchain?</Text>
					<SizedBox height={4} />
					<StyledLink
						rel="noopener noreferrer"
						target="_blank"
						href="https://stalkerairdrop.medium.com/fuel-testnet-swaylend-db9ce8d10cb4#f93f"
					>
						Learn more about wallets
					</StyledLink>
				</Column>
			</Body>
		</Root>
	);
});

export default ConnectWallet;
