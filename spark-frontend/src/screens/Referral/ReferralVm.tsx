import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<ReferralVM | null>(null);

interface IProps {
	children: React.ReactNode;
}

export const ReferralVMProvider: React.FC<IProps> = ({ children }) => {
	const rootStore = useStores();
	const store = useMemo(() => new ReferralVM(rootStore), [rootStore]);
	return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useReferralVM = () => useVM(ctx);

class ReferralVM {
	public rootStore: RootStore;

	loading: boolean = false;
	private _setLoading = (l: boolean) => (this.loading = l);

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
	}

	initialized: boolean = true;

	mint = async (assetId?: string) => {
		this._setLoading(true);
		const { accountStore, notificationStore } = this.rootStore;
		const wallet = await accountStore.getWallet();
		if (wallet == null) return;
		// const tokenFactoryContract = TokenFactoryAbi__factory.connect(tokenFactory, wallet);

		// try {
		// 	const token = TOKENS_BY_ASSET_ID[assetId];
		// 	const amount = BN.parseUnits(faucetAmounts[token.symbol], token.decimals);
		// 	const hash = hashMessage(token.symbol);
		// 	const userAddress = wallet.address.toB256();
		//
		// 	const { transactionResult } = await tokenFactoryContract.functions
		// 		.mint({ value: userAddress }, hash, amount.toString())
		// 		.txParams({ gasPrice: 2 })
		// 		.call();
		// 	if (transactionResult != null) {
		// 		const token = TOKENS_BY_ASSET_ID[assetId];
		// 		if (token !== TOKENS_BY_SYMBOL.ETH) {
		// 			this.rootStore.settingsStore.addMintedToken(assetId);
		// 		}
		// 		const txId = transactionResult.id ?? "";
		// 		this.rootStore.notificationStore.toast(`You have successfully minted ${token.symbol}`, {
		// 			link: `${EXPLORER_URL}/transaction/${txId}`,
		// 			linkTitle: "View on Explorer",
		// 			type: "success",
		// 			copyTitle: `Copy tx id: ${centerEllipsis(txId, 8)}`,
		// 			copyText: transactionResult.id,
		// 			title: "Transaction is completed!",
		// 		});
		// 	}
		// 	await this.rootStore.accountStore.updateAccountBalances();
		// } catch (e) {
		// 	const errorText = e?.toString();
		// 	console.log(errorText);
		// 	notificationStore.toast(errorText ?? "", { type: "error" });
		// } finally {
		// 	this._setLoading(false);
		// }
	};
}
