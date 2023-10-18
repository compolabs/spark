import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { ReferalContractAbi__factory } from "@src/contracts";
import { CONTRACT_ADDRESSES } from "@src/constants";

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
		console.log("constructor of ReferralVM");
		this.rootStore = rootStore;
		makeAutoObservable(this);
		this.verifyUser();
	}

	initialized: boolean = true;

	verifyUser = async () => {
		console.log("verifyUser");
		this._setLoading(true);
		const { accountStore, notificationStore } = this.rootStore;
		const wallet = await accountStore.getWallet();
		const userAddress = accountStore.addressInput;
		if (wallet == null || userAddress == null) return;
		const refContract = ReferalContractAbi__factory.connect(CONTRACT_ADDRESSES.referral, wallet);

		try {
			const { transactionResult } = await refContract.functions.verify(userAddress).txParams({ gasPrice: 2 }).call();
			console.log("transactionResult", transactionResult);
		} catch (e) {
			const errorText = e?.toString();
			console.log(errorText);
			notificationStore.toast(errorText ?? "", { type: "error" });
		} finally {
			this._setLoading(false);
		}
	};
}
