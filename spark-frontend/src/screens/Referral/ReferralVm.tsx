import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import { ReferalContractAbi__factory } from "@src/contracts";
import { CONTRACT_ADDRESSES, TOKENS_BY_SYMBOL } from "@src/constants";
import { Address } from "fuels";

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

		await refContract.functions
			.verify(userAddress)
			.simulate()
			.then(() => {
				notificationStore.toast("You are verified to access app", { type: "success" });
				settingsStore.addVerifiedAddress(address);
			})
			.catch(() => {
				notificationStore.toast("You are not verified to access app", { type: "error" });
			})
			.finally(() => this._setLoading(false));
	};

	registerUser = async (refAddress: string) => {
		const { accountStore, notificationStore, settingsStore } = this.rootStore;
		const wallet = await accountStore.getWallet();
		const address = accountStore.address;
		if (wallet == null || address == null) return;

		const ethBalance = accountStore.getBalance(TOKENS_BY_SYMBOL.ETH);
		if (ethBalance?.lt(50)) {
			notificationStore.toast("You don't have enough ETH for fee", { type: "error" });
			return;
		}
		this._setLoading(true);
		const refContract = ReferalContractAbi__factory.connect(CONTRACT_ADDRESSES.referral, wallet);

		try {
			const ref = Address.fromString(refAddress).toB256();
			await refContract.functions.chekin({ value: ref }).call();
			settingsStore.addVerifiedAddress(address);
		} catch (e) {
			console.error(e);
			notificationStore.toast("Couldn't register your ref address", { type: "error" });
		} finally {
			this._setLoading(false);
		}
	};
}
