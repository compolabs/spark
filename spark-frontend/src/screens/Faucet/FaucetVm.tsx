import React, { useMemo } from "react";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { TOKENS_BY_ASSET_ID, TOKENS_LIST } from "@src/constants";
import BN from "@src/utils/BN";
import useVM from "@src/hooks/useVM";

const ctx = React.createContext<FaucetVM | null>(null);

interface IProps {
	children: React.ReactNode;
}

export const FaucetVMProvider: React.FC<IProps> = ({ children }) => {
	const rootStore = useStores();
	const store = useMemo(() => new FaucetVM(rootStore), [rootStore]);
	return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useFaucetVM = () => useVM(ctx);

const faucetAmounts: Record<string, number> = {
	ETH: 0.5,
	USDC: 3000,
	BTC: 0.01,
	UNI: 50,
	// LINK: 50,
	// COMP: 5,
};
const availableToMint = ["ETH", "UNI", "USDC"];

class FaucetVM {
	public rootStore: RootStore;

	loading: boolean = false;
	actionTokenAssetId: string | null = null;
	initialized: boolean = true;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
	}

	get faucetTokens() {
		const { accountStore } = this.rootStore;
		if (accountStore.tokenBalances == null) return [];

		return TOKENS_LIST.map((v) => {
			const balance = accountStore.getBalance(v.assetId);
			const mintAmount = new BN(faucetAmounts[v.symbol] ?? 0);
			const formatBalance = BN.formatUnits(balance ?? BN.ZERO, v.decimals);
			return {
				...TOKENS_BY_ASSET_ID[v.assetId],
				...balance,
				formatBalance,
				mintAmount,
				disabled: !availableToMint.includes(v.symbol),
			};
		});
	}

	setActionTokenAssetId = (l: string | null) => (this.actionTokenAssetId = l);

	mint = async (assetId?: string) => {
		// if (assetId == null) return;
		// const { accountStore, notificationStore } = this.rootStore;
		// await accountStore.checkConnectionWithWallet();
		// try {
		// 	this._setLoading(true);
		// 	this.setActionTokenAssetId(assetId);
		// 	const tokenFactory = CONTRACT_ADDRESSES.tokenFactory;
		// 	const wallet = await accountStore.getWallet();
		// 	if (wallet == null || accountStore.addressInput == null) return;
		// 	const tokenFactoryContract = TokenAbi__factory.connect(tokenFactory, wallet);
		//
		// 	const token = TOKENS_BY_ASSET_ID[assetId];
		// 	const amount = BN.parseUnits(faucetAmounts[token.symbol], token.decimals);
		// 	const hash = hashMessage(token.symbol);
		// 	const identity = { Address: accountStore.addressInput };
		//
		// 	const { transactionResult } = await tokenFactoryContract.functions
		// 		.mint(identity, hash, amount.toString())
		// 		.txParams({ gasPrice: 1 })
		// 		.call();
		// 	if (transactionResult != null) {
		// 		const token = TOKENS_BY_ASSET_ID[assetId];
		// 		this.rootStore.notificationStore.toast(`You have successfully minted ${token.symbol}`, {
		// 			type: "success",
		// 		});
		// 	}
		// 	await this.rootStore.accountStore.updateAccountBalances();
		// } catch (e) {
		// 	const errorText = e?.toString();
		// 	console.log(errorText);
		// 	notificationStore.toast(errorText ?? "", { type: "error" });
		// } finally {
		// 	this.setActionTokenAssetId(null);
		// 	this._setLoading(false);
		// }
	};

	addAsset = async (assetId: string) => {
		// const { fuel } = this.rootStore.accountStore;
		// if (assetId === TOKENS_BY_SYMBOL.ETH.assetId || fuel == null) return;
		// const token = TOKENS_BY_ASSET_ID[assetId];
		// const asset = {
		// 	name: token.name,
		// 	assetId: token.assetId,
		// 	imageUrl: window.location.origin + token.logo,
		// 	symbol: token.symbol,
		// 	isCustom: true,
		// };
		// return fuel.addAsset(asset);
	};

	private _setLoading = (l: boolean) => (this.loading = l);
}
