import React from "react";
import Text, { TEXT_TYPES } from "@components/Text";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { LOGIN_TYPE } from "@stores/AccountStore";
import { useStores } from "@stores";
import { observer } from "mobx-react";

interface IProps {}

const ConnectWalletInterface: React.FC<IProps> = observer(() => {
	const { accountStore } = useStores();
	console.log("accountStore.listConnectors", accountStore.listConnectors);
	const wallets = [
		{
			name: "Fuel Wallet",
			type: LOGIN_TYPE.FUEL_WALLET,
			// downloadLink: "https://wallet.fuel.network/docs/install/",
			active: accountStore.listConnectors.includes(LOGIN_TYPE.FUEL_WALLET),
		},
		{
			name: "Fuelet",
			type: LOGIN_TYPE.FUELET,
			// downloadLink: "https://fuelet.app",
			active: accountStore.listConnectors.includes(LOGIN_TYPE.FUELET),
		},
		{ name: "Create account", type: LOGIN_TYPE.GENERATE_SEED, active: true },
		{
			name: "Fuel Wallet Dev",
			type: LOGIN_TYPE.FUEL_DEV,
			// downloadLink: "https://chrome.google.com/webstore/detail/fuel-wallet-development/hcgmehahnlbhpilepakbdinkhhaackmc",
			active: accountStore.listConnectors.includes(LOGIN_TYPE.FUEL_DEV),
		},
		{ name: "Metamask", active: false },
		{ name: "Ledger", active: false },
	];

	return (
		<>
			<Text type={TEXT_TYPES.H1}>Connect wallet</Text>
			<SizedBox height={40} />
			{wallets.map(({ name, active, type }) => (
				<Button
					key={name}
					style={{ marginBottom: 16 }}
					onClick={() => active && type && accountStore.login(type)}
					disabled={!active}
				>
					{name}
				</Button>
			))}
		</>
	);
});
export default ConnectWalletInterface;
