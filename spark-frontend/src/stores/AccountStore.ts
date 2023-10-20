import RootStore from "@stores/RootStore";
import { makeAutoObservable, reaction, when } from "mobx";
import { Address, Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";
import { IToken, NODE_URL, TOKENS_LIST } from "@src/constants";
import BN from "@src/utils/BN";
import Balance from "@src/entities/Balance";
import { FuelWalletProvider } from "@fuel-wallet/sdk";

export enum LOGIN_TYPE {
	FUEL_WALLET = "Fuel Wallet",
	FUELET = "Fuelet Wallet",
}

export interface ISerializedAccountStore {
	address: string | null;
	loginType: LOGIN_TYPE | null;
}

class AccountStore {
	public readonly rootStore: RootStore;
	public provider: Provider | null = null;

	public get initialized() {
		return this.provider != null;
	}

	private setProvider = (provider: Provider | null) => (this.provider = provider);

	constructor(rootStore: RootStore, initState?: ISerializedAccountStore) {
		makeAutoObservable(this);

		this.rootStore = rootStore;
		if (initState) {
			this.setLoginType(initState.loginType);
			this.setAddress(initState.address);
			document.addEventListener("FuelLoaded", this.onFuelLoaded);
		}
		this.initProvider();
		when(() => this.provider != null, this.updateAccountBalances);
		setInterval(this.updateAccountBalances, 10 * 1000);
		reaction(
			() => this.address,
			() => Promise.all([this.updateAccountBalances()]),
		);
	}

	listConnectors: string[] = [];
	setListConnectors = (value: string[]) => (this.listConnectors = value);

	initProvider = async () => {
		Provider.create(NODE_URL)
			.then((provider) => this.setProvider(provider))
			.catch(console.error);
	};

	public assetBalances: Balance[] | null = null;
	setAssetBalances = (v: Balance[] | null) => (this.assetBalances = v);

	updateAccountBalances = async () => {
		if (this.address == null) {
			this.setAssetBalances([]);
			return;
		}
		const address = Address.fromString(this.address);
		const balances = (await this.provider?.getBalances(address)) ?? [];
		const assetBalances = TOKENS_LIST.map((asset) => {
			const t = balances.find(({ assetId }) => asset.assetId === assetId);
			const balance = t != null ? new BN(t.amount.toString()) : BN.ZERO;
			if (t == null) return new Balance({ balance, usdEquivalent: BN.ZERO, ...asset });

			return new Balance({ balance, ...asset });
		});
		this.setAssetBalances(assetBalances);
	};

	getBalance = (token: IToken): BN | null => {
		const balance = this.findBalanceByAssetId(token.assetId);
		if (balance == null) return null;
		return balance.balance ?? BN.ZERO;
	};
	findBalanceByAssetId = (assetId: string) =>
		this.assetBalances && this.assetBalances.find((balance) => balance.assetId === assetId);

	onFuelLoaded = () => {
		if (window.fuel == null) return;
		const connectors = window.fuel.listConnectors();
		this.setListConnectors(connectors.map((c: { name: string }) => c.name));
		window.fuel.on(window.fuel?.events?.currentAccount, this.handleAccEvent);
		window.fuel.on(window.fuel?.events?.network, this.handleNetworkEvent);
		window.fuel.on(window.fuel?.events?.currentConnector, this.handleConnectorEvent);
	};
	handleAccEvent = (account: string) => {
		console.log("handleAccEvent", account);
		this.setAddress(account);
	};
	handleConnectorEvent = (con: string) => {
		console.log("handleConnectorEvent", con);
	};

	handleNetworkEvent = (network: FuelWalletProvider) => {
		if (network.url !== NODE_URL) {
			this.rootStore.notificationStore.toast(`Please change network url to Testnet Beta 4`);
		}
	};

	public address: string | null = null;
	setAddress = (address: string | null) => (this.address = address);

	public loginType: LOGIN_TYPE | null = null;
	setLoginType = (loginType: LOGIN_TYPE | null) => (this.loginType = loginType);

	serialize = (): ISerializedAccountStore => ({
		address: this.address,
		loginType: this.loginType,
	});

	login = async (loginType: LOGIN_TYPE) => {
		this.setLoginType(loginType);
		await this.loginWithWallet(loginType);
	};

	disconnect = async () => {
		try {
			window.fuel?.disconnect();
		} catch (e) {
			this.setAddress(null);
			this.setLoginType(null);
			return;
		}
		this.setAddress(null);
		this.setLoginType(null);
	};

	loginWithWallet = async (connector: LOGIN_TYPE) => {
		//fixme change to notification
		try {
			await window.fuel.selectConnector(connector);
			await window.fuel.connect();
			const account = await window.fuel.currentAccount();
			const provider = await window.fuel.getProvider();
			if (provider.url !== NODE_URL) {
				this.rootStore.notificationStore.toast(`Please change network url to beta 4`);
			}
			this.setAddress(account);
		} catch (e) {
			this.rootStore.notificationStore.toast("User denied", {
				type: "error",
			});
			return;
		}
	};

	get isLoggedIn() {
		return this.address != null;
	}

	getWallet = async (): Promise<WalletLocked | WalletUnlocked | null> => {
		if (this.address == null || window.fuel == null) return null;
		return window.fuel.getWallet(this.address);
	};

	get walletToRead(): WalletLocked | null {
		return this.provider == null
			? null
			: Wallet.fromAddress("fuel1m56y48mej3366h6460y4rvqqt62y9vn8ad3meyfa5wkk5dc6mxmss7rwnr", this.provider ?? "");
	}

	get addressInput(): null | { value: string } {
		if (this.address == null) return null;
		return { value: Address.fromString(this.address).toB256() };
	}

	get addressB256(): null | string {
		if (this.address == null) return null;
		return Address.fromString(this.address).toB256();
	}
}

export default AccountStore;
