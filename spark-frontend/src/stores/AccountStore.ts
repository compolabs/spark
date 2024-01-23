import { Contract, ethers } from "ethers";
import { makeAutoObservable, reaction } from "mobx";
import { Nullable } from "tsdef";

import ERC20_ABI from "@src/abi/ERC20_ABI.json";
import { TOKENS_BY_SYMBOL, TOKENS_LIST } from "@src/constants";
import BN from "@src/utils/BN";

import RootStore from "./RootStore";

export enum LOGIN_TYPE {
	METAMASK = "metamask",
	GENERATE_SEED = "generate_seed",
}

export interface ISerializedAccountStore {
	address: Nullable<string>;
	loginType: Nullable<LOGIN_TYPE>;
	mnemonic: Nullable<string>;
}

const networks = [
	{ name: "Arbitrum Sepolia", rpc: "https://arbitrum-sepolia-rpc.gateway.pokt.network", chainId: "421614" },
];

class AccountStore {
	rootStore: RootStore;
	network = networks[0]; //todo добавтиь функционал выбора сети
	provider: Nullable<ethers.Provider> = null;
	signer: Nullable<ethers.JsonRpcSigner> = null;
	loginType: Nullable<LOGIN_TYPE> = null;
	address: Nullable<string> = null;
	mnemonic: Nullable<string> = null;

	tokenBalances: Record<string, BN> = {};

	initialized: boolean = false;

	constructor(rootStore: RootStore, initState?: ISerializedAccountStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
		if (initState) {
			this.loginType = initState.loginType;
			this.address = initState.address;
			this.mnemonic = initState.mnemonic;
			this.address && this.connectWallet().then(this.updateTokenBalances);
		}
		this.init();
		reaction(() => this.address, this.updateTokenBalances);
		setInterval(this.updateTokenBalances, 10000); // обновление каждые 10 секунд
	}

	init = async () => {
		this.provider = new ethers.JsonRpcProvider(this.network.rpc);
		await Promise.all([this.updateTokenBalances()]).then(() => this.setInitialized(true));
	};

	connectWallet = async () => {
		if (!window.ethereum) {
			console.error("Ethereum wallet not found");
			return;
		}

		try {
			const ethereum = window.ethereum;
			await ethereum.request({ method: "eth_requestAccounts" });
			this.signer = await new ethers.BrowserProvider(ethereum).getSigner();

			const network = await this.signer.provider.getNetwork();
			if (network.chainId.toString() !== this.network.chainId) {
				//todo запросить переключение сети на нужную
				this.rootStore.notificationStore.toast("Connected to the wrong network", { type: "warning" });
				this.disconnect();
				return;
			}

			this.address = await this.signer.getAddress();
		} catch (error) {
			console.error("Error connecting to wallet:", error);
		}
	};

	disconnect = () => {
		this.address = null;
		this.signer = null;
		this.loginType = null;
		this.mnemonic = null;
		this.tokenBalances = {};
	};

	// Обновление балансов для всех токенов
	updateTokenBalances = async () => {
		if (!this.signer || !this.address) return;
		try {
			for (const token of TOKENS_LIST) {
				const balance = await this.fetchBalance(token.assetId);
				this.tokenBalances[token.assetId] = new BN(balance);
			}
		} catch (error) {
			console.error("Error updating token balances:", error);
		}
	};

	// Получение баланса для одного токена
	fetchBalance = async (assetId: string): Promise<string> => {
		if (!this.signer || !this.address) return "0";
		return assetId === TOKENS_BY_SYMBOL.ETH.assetId
			? await this.signer.provider.getBalance(this.address).then((res) => res.toString())
			: new Contract(assetId, ERC20_ABI.abi, this.signer).balanceOf(this.address);
	};

	// Получение баланса из стора
	getBalance = (assetId: string): BN => {
		return this.tokenBalances[assetId] ?? BN.ZERO;
	};

	getAddress = () => {
		return this.address;
	};

	isConnected = () => {
		return !!this.address;
	};

	serialize = (): ISerializedAccountStore => ({
		address: this.address,
		loginType: this.loginType,
		mnemonic: this.mnemonic,
	});

	private setInitialized = (initialized: boolean) => (this.initialized = initialized);
}

export default AccountStore;
