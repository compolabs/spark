import RootStore from "@stores/RootStore";
import { makeAutoObservable, reaction, when } from "mobx";
import { Address, Mnemonic, Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";
import { IToken, NODE_URL, SEED, TOKENS_BY_ASSET_ID, TOKENS_LIST } from "@src/constants";
import BN from "@src/utils/BN";
import Balance from "@src/entities/Balance";
import { FuelWalletProvider } from "@fuel-wallet/sdk";

export enum LOGIN_TYPE {
	FUEL_WALLET = "FUEL_WALLET",
	FUELET = "FUELET"
}

export interface ISerializedAccountStore {
	address: string | null;
	loginType: LOGIN_TYPE | null;
}

class AccountStore {
	public readonly rootStore: RootStore;
	public provider: Provider | null = null;
	private setProvider = (provider: Provider | null) => (this.provider = provider);

	constructor(rootStore: RootStore, initState?: ISerializedAccountStore) {
		makeAutoObservable(this);

		this.rootStore = rootStore;
		if (initState) {
			this.setLoginType(initState.loginType);
			// this.setAddress(initState.address);
			this.setAddress("fuel10234lk7dncl0dpr4g9lntdaavauw07h6tu95kxg2x57mjqqcxgfqel2z8w");
			if (initState.loginType != null) {
				document.addEventListener("FuelLoaded", this.onFuelLoaded);
			}
		}
		this.initProvider();
		when(() => this.provider != null, this.updateAccountBalances);
		setInterval(this.updateAccountBalances, 10 * 1000);
		reaction(
			() => this.address,
			() => Promise.all([this.updateAccountBalances()])
		);
	}

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
		balances.map((b) => b.amount.gt(0) && console.log(TOKENS_BY_ASSET_ID[b.assetId].symbol, b.amount.toString()));
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
		return BN.formatUnits(balance.balance ?? BN.ZERO, token.decimals);
	};

	findBalanceByAssetId = (assetId: string) =>
		this.assetBalances && this.assetBalances.find((balance) => balance.assetId === assetId);

	onFuelLoaded = () => {
		if (this.walletInstance == null) return;
		this.walletInstance.on(window?.fuel.events.currentAccount, this.handleAccEvent);
		this.walletInstance.on(window?.fuel.events?.network, this.handleNetworkEvent);
	};
	handleAccEvent = (account: string) => this.setAddress(account);

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
		loginType: this.loginType
	});

	// login = async (loginType: LOGIN_TYPE) => {
	login = async (loginType?: LOGIN_TYPE) => {
		const provider = await Provider.create(NODE_URL);
		const wallet = Wallet.fromPrivateKey(SEED, provider);
		this.setAddress(wallet.address.toString());
		console.log("wallet.address.toString()", wallet.address.toString());

		// const mnemonic = Mnemonic.generate(16);
		// const seed = Mnemonic.mnemonicToSeed(mnemonic);
		// console.log("seed", seed);
		// const provider = await Provider.create(NODE_URL);
		// const wallet = Wallet.fromPrivateKey(seed, provider);
		// console.log("wallet", wallet.address)

		//old
		// this.setLoginType(loginType);
		// await this.loginWithWallet();
		// await this.onFuelLoaded();
	};

	get walletInstance() {
		switch (this.loginType) {
			case LOGIN_TYPE.FUEL_WALLET:
				return window.fuel;
			case LOGIN_TYPE.FUELET:
				return window.fuelet;
			default:
				return null;
		}
	}

	disconnect = async () => {
		try {
			this.walletInstance.disconnect();
		} catch (e) {
			this.setAddress(null);
			this.setLoginType(null);
		}
		this.setAddress(null);
		this.setLoginType(null);
	};

	loginWithWallet = async () => {
		//fixme change to notification
		if (this.walletInstance == null) throw new Error("There is no wallet instance");
		// const res = await this.walletInstance.connect({ url: NODE_URL });
		const res = await this.walletInstance.connect();
		if (!res) {
			this.rootStore.notificationStore.toast("User denied", {
				type: "error"
			});
			return;
		}
		const account = await this.walletInstance.currentAccount();
		const provider = await this.walletInstance.getProvider();
		if (provider.url !== NODE_URL) {
			this.rootStore.notificationStore.toast(`Please change network url to beta 4`);
		}
		this.setAddress(account);
	};

	get isLoggedIn() {
		return this.address != null;
	}

	getWallet = async (): Promise<WalletLocked | WalletUnlocked | null> => {
		if (this.provider == null) return null;
		return Wallet.fromPrivateKey(SEED, this.provider);
		//todo fix
		// if (this.address == null || window.fuel == null) return null;
		// return window.fuel.getWallet(this.address);
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
