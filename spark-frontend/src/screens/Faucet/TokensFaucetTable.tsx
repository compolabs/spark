import React, { useMemo, useState } from "react";
import { useStores } from "@stores";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import Button from "@components/Button";
import { FAUCET_URL, TOKENS_BY_SYMBOL } from "@src/constants";
import { useFaucetVM } from "@screens/Faucet/FaucetVm";
import { observer } from "mobx-react-lite";
import Table from "@components/Table";
import { useNavigate } from "react-router-dom";

interface IProps {}

const TokensFaucetTable: React.FC<IProps> = () => {
	const { accountStore, settingsStore } = useStores();
	const vm = useFaucetVM();
	const navigate = useNavigate();
	const [tokens, setTokens] = useState<any>([]);
	const ethBalance = accountStore.getBalance(TOKENS_BY_SYMBOL.ETH);
	useMemo(() => {
		setTokens(
			vm.faucetTokens.map((t) => ({
				asset: (
					<Row>
						<SizedBox width={16} />
						<Text style={{ whiteSpace: "nowrap" }}>{t.name}</Text>
					</Row>
				),
				amount: (
					<Column crossAxisSize="max">
						<Text style={{ whiteSpace: "nowrap" }}>{`${t.mintAmount.toFormat()} ${t.symbol}`}</Text>
					</Column>
				),
				balance: (
					<Column crossAxisSize="max">
						<Text style={{ whiteSpace: "nowrap" }}>{`${t.formatBalance?.toFormat(2)} ${t.symbol}`}</Text>
					</Column>
				),
				btn: (() => {
					if (!accountStore.isLoggedIn && t.symbol !== "ETH")
						return (
							<Button primary onClick={() => navigate("/")}>
								Connect wallet
							</Button>
						);
					if (!vm.initialized)
						return (
							<Button primary disabled>
								Loading...
							</Button>
						);
					if (ethBalance?.eq(0) && t.symbol !== "ETH") return <Button primary>Mint</Button>;
					return (
						<Button
							primary
							disabled={vm.loading || !vm.initialized}
							onClick={() => {
								if (t.symbol === "ETH") {
									window.open(
										accountStore.address == null ? FAUCET_URL : `${FAUCET_URL}/?address=${accountStore.address}`,
										"blank",
									);
								} else {
									vm.mint(t.assetId);
								}
							}}
						>
							{vm.loading && vm.actionTokenAssetId === t.assetId ? "Loading..." : "Mint"}
						</Button>
					);
				})(),
			})),
		);
		/* eslint-disable */
	}, [accountStore.address, accountStore.isLoggedIn, settingsStore, vm.loading, ethBalance]);
	const columns = React.useMemo(
		() => [
			{
				Header: "Asset",
				accessor: "asset",
			},
			{
				Header: "Mint amount",
				accessor: "amount",
			},
			{
				Header: "My balance",
				accessor: "balance",
			},
			{
				Header: " ",
				accessor: "btn",
			},
		],
		[],
	);
	return <Table columns={columns} data={tokens} />;
};
export default observer(TokensFaucetTable);
