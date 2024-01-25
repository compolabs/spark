import React, { useMemo } from "react";
import { ethers } from "ethers";
import { makeAutoObservable } from "mobx";
import tokenABI from "src/abi/ERC20_ABI.json";

import { TOKENS_BY_ASSET_ID, TOKENS_LIST } from "@src/constants";
import useVM from "@src/hooks/useVM";
import BN from "@src/utils/BN";
import { RootStore, useStores } from "@stores";

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
		if (accountStore.tokenBalances === null) return [];

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
		const { accountStore, notificationStore } = this.rootStore;
		if (assetId === null) return;

		const tokenContract = new ethers.Contract(TOKENS_BY_ASSET_ID["ETH"].assetId, tokenABI.abi, accountStore.signer);

		const toAddress = accountStore.address; // адрес, на который будет отправлен токен
		const amount = ethers.parseUnits(faucetAmounts["ETH"].toString(), TOKENS_BY_ASSET_ID["ETH"].decimals);
		console.log(amount);

		// Отправка транзакции
		const tx = await tokenContract.mint(toAddress, amount);
		console.log("Транзакция отправлена:", tx.hash);

		// Ожидание завершения транзакции
		await tx.wait();
		console.log("Минтинг выполнен");
	};

	// addAsset = async (assetId: string) => {
	// 	const { fuel } = this.rootStore.accountStore;
	// 	if (assetId === TOKENS_BY_SYMBOL.ETH.assetId || fuel == null) return;
	// 	const token = TOKENS_BY_ASSET_ID[assetId];
	// 	const asset = {
	// 		name: token.name,
	// 		assetId: token.assetId,
	// 		imageUrl: window.location.origin + token.logo,
	// 		symbol: token.symbol,
	// 		isCustom: true,
	// 	};
	// 	return fuel.addAsset(asset);
	// };

	private _setLoading = (l: boolean) => (this.loading = l);
}
