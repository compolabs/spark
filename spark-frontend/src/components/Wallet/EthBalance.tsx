import styled from "@emotion/styled";
import React from "react";
// import { ReactComponent as BalanceIcon } from "@src/assets/icons/balance.svg";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { useStores } from "@stores";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
	display: flex;
	align-items: center;
`;

const EthBalance: React.FC<IProps> = () => {
	const { accountStore } = useStores();
	const eth = TOKENS_BY_SYMBOL.ETH;
	const balance = accountStore.findBalanceByAssetId(eth.assetId);
	const formattedBalance = BN.formatUnits(balance?.balance ?? BN.ZERO, eth?.decimals);
	if (accountStore.address == null) return null;
	return (
		<Root>
			{/*<BalanceIcon style={{ flexShrink: 0 }} />*/}
			<SizedBox width={8} />
			<Text style={{ color: "#fff", fontSize: 14 }}>{formattedBalance.toFormat(4)} ETH</Text>
		</Root>
	);
};
export default observer(EthBalance);
