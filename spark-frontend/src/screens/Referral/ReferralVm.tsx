import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction } from "mobx";
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
		reaction(
			() => [this.rootStore.accountStore],
			() => this.verifyUser(),
		);
	}

	initialized: boolean = true;

	verifyUser = async () => {
		const { accountStore, notificationStore, settingsStore } = this.rootStore;
		const wallet = await accountStore.getWallet();
		const userAddress = accountStore.addressInput;
		const address = accountStore.address;
		if (wallet == null || userAddress == null || address == null) return;
		if (settingsStore.verifiedAddresses.includes(address)) return;
		this._setLoading(true);
		const refContract = ReferalContractAbi__factory.connect(CONTRACT_ADDRESSES.referral, wallet);

		try {
			await refContract.functions.verify(userAddress).simulate();
			notificationStore.toast("You are verified to access app", { type: "success" });
			this.rootStore.settingsStore.addVerifiedAddress(address);
		} catch (e) {
			console.log("not verified user");
			notificationStore.toast("You are not verified to access app", { type: "error" });
		} finally {
			this._setLoading(false);
		}
	};
}
