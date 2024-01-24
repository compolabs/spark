import React, { PropsWithChildren, useMemo } from "react";
import { BigNumberish, ethers } from "ethers";
import { makeAutoObservable } from "mobx";

import SPOT_MARKET_ABI from "@src/abi/SPOT_MARKET_ABI.json";
import { CONTRACT_ADDRESSES, TOKENS_BY_SYMBOL } from "@src/constants";
import useVM from "@src/hooks/useVM";
import BN from "@src/utils/BN";
import { RootStore, useStores } from "@stores";

const ctx = React.createContext<CreateOrderSpotVM | null>(null);

export const CreateOrderSpotVMProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const rootStore = useStores();
	const store = useMemo(() => new CreateOrderSpotVM(rootStore), [rootStore]);
	return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useCreateOrderSpotVM = () => useVM(ctx);

//todo рефактор
class CreateOrderSpotVM {
	loading = false;
	isSell = false;
	buyPrice: BN = BN.ZERO;
	buyAmount: BN = BN.ZERO;
	buyPercent: BN = new BN(0);
	buyTotal: BN = BN.ZERO;
	sellPrice: BN = BN.ZERO;
	sellAmount: BN = BN.ZERO;
	sellPercent: BN = new BN(0);
	sellTotal: BN = BN.ZERO;

	constructor(private rootStore: RootStore) {
		makeAutoObservable(this);
	}

	get canBuy() {
		return (
			this.rootStore.accountStore.provider &&
			this.buyAmount.gt(0) &&
			this.buyPrice.gt(0) &&
			this.buyTotal.gt(0) &&
			!this.buyTotalError
		);
	}

	get canSell() {
		return (
			this.rootStore.accountStore.provider &&
			this.sellAmount.gt(0) &&
			this.sellPrice.gt(0) &&
			this.sellTotal.gt(0) &&
			!this.sellAmountError
		);
	}

	get sellAmountError(): boolean | undefined {
		const { accountStore, tradeStore } = this.rootStore;
		const balance = accountStore.getBalance(tradeStore.market!.baseToken.assetId);
		return balance ? this.sellAmount.gt(balance) : false;
	}

	get buyTotalError(): boolean {
		const { accountStore, tradeStore } = this.rootStore;
		const balance = accountStore.getBalance(tradeStore.market!.quoteToken.assetId);
		return balance ? this.buyTotal.gt(balance) : false;
	}

	setIsSell = (isSell: boolean) => (this.isSell = isSell);

	onMaxClick = () => {
		const { accountStore, tradeStore } = this.rootStore;

		const tokenId = this.isSell ? tradeStore.market!.baseToken.assetId : tradeStore.market!.quoteToken.assetId;
		let balance = accountStore.getBalance(tokenId) ?? BN.ZERO;
		if (tokenId === TOKENS_BY_SYMBOL.ETH.assetId) {
			balance = balance.minus(5 * 1e9); // 0.5 gway
		}
		this.isSell ? this.setSellAmount(balance, true) : this.setBuyTotal(balance, true);
	};

	setBuyPrice = (price: BN, sync?: boolean) => {
		const { tradeStore } = this.rootStore;

		this.buyPrice = price;
		if (price.eq(0)) this.setBuyTotal(BN.ZERO);
		if (this.buyAmount.gt(0) && price.gt(0) && sync) {
			//!  не нравятся названия переменных v1 и v2
			const v1 = BN.formatUnits(price, 9);
			const v2 = BN.formatUnits(this.buyAmount, tradeStore.market!.baseToken.decimals);
			this.setBuyTotal(BN.parseUnits(v2.times(v1), tradeStore.market!.quoteToken.decimals));
		}
	};

	setBuyAmount = (amount: BN, sync?: boolean) => {
		const { tradeStore } = this.rootStore;
		this.buyAmount = amount;
		if (this.buyPrice.gt(0) && amount.gt(0) && sync) {
			//! не нравятся названия переменных v1 и v2
			const v1 = BN.formatUnits(this.buyPrice, 9);
			const v2 = BN.formatUnits(amount, tradeStore.market!.baseToken.decimals);
			const total = BN.parseUnits(v2.times(v1), tradeStore.market!.quoteToken.decimals);
			this.setBuyTotal(total);
			const balance = this.rootStore.accountStore.getBalance(tradeStore.market!.quoteToken.assetId);
			if (!balance) return;
			const percent = total.times(100).div(balance);
			this.setBuyPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	setBuyPercent = (value: number | number[]) => (this.buyPercent = new BN(value.toString()));

	setBuyTotal = (total: BN, sync?: boolean) => {
		const { tradeStore } = this.rootStore;
		this.buyTotal = total;
		if (this.buyPrice.gt(0) && sync) {
			//! не нравятся названия переменных v1 и v2
			const v1 = BN.formatUnits(this.buyPrice, 9);
			const v2 = BN.formatUnits(total, tradeStore.market!.quoteToken.decimals);
			this.setBuyAmount(BN.parseUnits(v2.div(v1), tradeStore.market!.baseToken.decimals));
			const balance = this.rootStore.accountStore.getBalance(tradeStore.market!.quoteToken.assetId);
			if (!balance) return;
			const percent = total.times(100).div(balance);
			this.setBuyPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	setSellPrice = (price: BN, sync?: boolean) => {
		const { tradeStore } = this.rootStore;
		console.log(price);
		this.sellPrice = price;
		if (price.eq(0)) this.setSellTotal(BN.ZERO);
		if (this.sellAmount.gt(0) && price.gt(0) && sync) {
			//! не нравятся названия переменных v1 и v2
			const v1 = BN.formatUnits(price, 9);
			const v2 = BN.formatUnits(this.sellAmount, tradeStore.market!.baseToken.decimals);
			this.setSellTotal(BN.parseUnits(v2.times(v1), tradeStore.market!.quoteToken.decimals));
		}
	};

	setSellAmount = (amount: BN, sync?: boolean) => {
		const { tradeStore } = this.rootStore;
		this.sellAmount = amount;
		if (amount.eq(0)) this.setSellTotal(BN.ZERO);
		if (this.sellPrice.gt(0) && amount.gt(0) && sync) {
			//! не нравятся названия переменных v1 и v2
			const v1 = BN.formatUnits(this.sellPrice, 9);
			const v2 = BN.formatUnits(amount, tradeStore.market!.baseToken.decimals);
			this.setSellTotal(BN.parseUnits(v2.times(v1), tradeStore.market!.quoteToken.decimals));
			const balance = this.rootStore.accountStore.getBalance(tradeStore.market!.baseToken.assetId);
			if (!balance) return;
			const percent = amount.times(100).div(balance);
			this.setSellPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	setSellPercent = (value: number | number[]) => (this.sellPercent = new BN(value.toString()));

	setSellTotal = (total: BN, sync?: boolean) => {
		const { tradeStore } = this.rootStore;

		this.sellTotal = total;
		if (this.sellPrice.gt(0) && sync) {
			//! не нравятся названия переменных v1 и v2
			const v1 = BN.formatUnits(this.sellPrice, 9);
			const v2 = BN.formatUnits(total, tradeStore.market!.quoteToken.decimals);
			const amount = BN.parseUnits(v2.div(v1), tradeStore.market!.baseToken.decimals);
			this.setSellAmount(amount);
			const balance = this.rootStore.accountStore.getBalance(tradeStore.market!.baseToken.assetId);
			if (!balance) return;
			const percent = amount.times(100).div(balance);
			this.setSellPercent(percent.gt(100) ? 100 : +percent.toFormat(0));
		}
	};

	//todo починить
	createOrder = async () => {
		const { accountStore } = this.rootStore;
		if (!accountStore.signer || !this.rootStore.tradeStore.market) return;
		const contract = new ethers.Contract(CONTRACT_ADDRESSES.spotMarket, SPOT_MARKET_ABI.abi, accountStore.signer);
		const baseSize = this.isSell ? this.sellAmount.times(-1) : this.buyAmount;
		this.setLoading(true);
		const baseToken = this.rootStore.tradeStore.market.baseToken.assetId;

		const transaction = await contract.openOrder(baseToken, baseSize.toString() as BigNumberish, this.sellPrice);
		await transaction.wait();
		//todo sync orderbook
		//todo notifications
		this.setLoading(false);
	};

	private setLoading = (l: boolean) => (this.loading = l);
}
