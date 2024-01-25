import { Contract } from "ethers";
import { makeAutoObservable, reaction } from "mobx";

import { ERC20_ABI } from "@src/abi";
import { TOKENS_BY_SYMBOL, TOKENS_LIST } from "@src/constants";
import BN from "@src/utils/BN";
import { IntervalUpdater } from "@src/utils/IntervalUpdater";

import RootStore from "./RootStore";

const UPDATE_INTERVAL = 10 * 1000;

export class BalanceStore {
	private balances: Map<string, BN> = new Map();

	private balancesUpdater: IntervalUpdater;

	constructor(private rootStore: RootStore) {
		makeAutoObservable(this);

		this.balancesUpdater = new IntervalUpdater(this.update, UPDATE_INTERVAL);

		this.balancesUpdater.run();

		const { accountStore } = rootStore;

		reaction(
			() => accountStore.isConnected,
			(isConnected) => {
				if (!isConnected) return;

				this.balancesUpdater.update();
			},
		);
	}

	update = async () => {
		const { accountStore } = this.rootStore;

		if (!accountStore.isConnected) return;

		try {
			for (const token of TOKENS_LIST) {
				const balance = await this.fetchBalance(token.assetId);
				this.balances.set(token.assetId, new BN(balance));
			}
		} catch (error) {
			console.error("Error updating token balances:", error);
		}
	};

	getBalance = (assetId: string) => {
		return this.balances.get(assetId) ?? BN.ZERO;
	};

	getFormatBalance = (assetId: string, decimals: number) => {
		return BN.formatUnits(this.getBalance(assetId), decimals).toFormat(2) ?? "-";
	};

	private fetchBalance = async (assetId: string): Promise<string> => {
		const { accountStore } = this.rootStore;

		if (!accountStore.isConnected) return "0";

		if (assetId === TOKENS_BY_SYMBOL.ETH.assetId) {
			const balance = await accountStore.signer!.provider.getBalance(accountStore.address!);
			return balance.toString();
		}

		const contract = new Contract(assetId, ERC20_ABI, accountStore.signer!);
		const balance = await contract.balanceOf(accountStore.address!);
		return balance;
	};
}
