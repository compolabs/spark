import styled from "@emotion/styled";
import React from "react";
import Text, { TEXT_TYPES } from "@components/Text";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import { LOGIN_TYPE } from "@stores/AccountStore";
import { Column } from "@components/Flex";
import { useStores } from "@stores";
import { StyledLink } from "./Referral";
import { observer } from "mobx-react";

interface IProps {}

const ConnectWalletInterface: React.FC<IProps> = observer(() => {
	const { accountStore } = useStores();

	return (
		<>
			<Text type={TEXT_TYPES.H1}>Connect wallet</Text>
			<SizedBox height={40} />
			<Button
				onClick={() =>
					window.fuel == null
						? window.open("https://wallet.fuel.network/docs/install/")
						: accountStore.login(LOGIN_TYPE.FUEL_WALLET)
				}
			>
				Fuel Wallet
			</Button>
			<SizedBox height={16} />
			<Button disabled>Fuelet</Button>
			<SizedBox height={16} />
			<Button disabled>Metamask</Button>
			<SizedBox height={16} />
			<Button disabled>Ledger</Button>
		</>
	);
});
export default ConnectWalletInterface;
