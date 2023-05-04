import RootStore from "@stores/RootStore";
import { makeAutoObservable, reaction } from "mobx";
import { Address, Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";
import { IToken, NODE_URL, TOKENS_LIST } from "@src/constants";
import Balance from "@src/entities/Balance";
import BN from "@src/utils/BN";
import { FuelProviderConfig } from "@fuel-wallet/sdk";

export enum LOGIN_TYPE {
  FUEL_WALLET = "FUEL_WALLET",
  PRIVATE_KEY = "PRIVATE_KEY",
  FUELET = "FUELET",
}

export interface ISerializedAccountStore {
  address: string | null;
  loginType: LOGIN_TYPE | null;
  privateKey: string | null;
}

class AccountStore {
  public readonly rootStore: RootStore;
  public provider = new Provider(NODE_URL);

  constructor(rootStore: RootStore, initState?: ISerializedAccountStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    if (initState) {
      this.setLoginType(initState.loginType);
      this.setAddress(initState.address);
      this.setPrivateKey(initState.privateKey);
      if (initState.loginType === LOGIN_TYPE.FUEL_WALLET) {
        document.addEventListener("FuelLoaded", this.onFuelLoaded);
      }
    }
    this.updateAccountBalances().then();
    setInterval(this.updateAccountBalances, 10 * 1000);
    reaction(
      () => this.address,
      () => Promise.all([this.updateAccountBalances()])
    );
  }

  onFuelLoaded = () => {
    if (this.walletInstance == null) return;
    this.walletInstance.on(
      window?.fuel.events.currentAccount,
      this.handleAccEvent
    );
    this.walletInstance.on(
      window?.fuel.events?.network,
      this.handleNetworkEvent
    );
  };
  handleAccEvent = (account: string) => this.setAddress(account);
  handleNetworkEvent = (network: FuelProviderConfig) => {
    if (network.url !== NODE_URL) {
      this.rootStore.notificationStore.toast(
        `Please change network url to Testnet Beta 3`,
        {
          link: NODE_URL,
          linkTitle: "Go to Testnet Beta 3",
          type: "error",
          title: "Attention",
        }
      );
    }
  };

  public address: string | null = null;
  setAddress = (address: string | null) => (this.address = address);

  public privateKey: string | null = null;
  setPrivateKey = (key: string | null) => (this.privateKey = key);

  public loginType: LOGIN_TYPE | null = null;
  setLoginType = (loginType: LOGIN_TYPE | null) => (this.loginType = loginType);

  public assetBalances: Balance[] | null = null;
  setAssetBalances = (v: Balance[] | null) => (this.assetBalances = v);

  updateAccountBalances = async () => {
    if (this.address == null) {
      this.setAssetBalances([]);
      return;
    }
    const address = Address.fromString(this.address);
    const balances = await this.provider.getBalances(address);
    const assetBalances = TOKENS_LIST.map((asset) => {
      const t = balances.find(({ assetId }) => asset.assetId === assetId);
      const balance = t != null ? new BN(t.amount.toString()) : BN.ZERO;
      if (t == null)
        return new Balance({ balance, usdEquivalent: BN.ZERO, ...asset });

      return new Balance({ balance, ...asset });
    });
    this.setAssetBalances(assetBalances);
  };
  findBalanceByAssetId = (assetId: string) =>
    this.assetBalances &&
    this.assetBalances.find((balance) => balance.assetId === assetId);

  get balances() {
    const { accountStore } = this.rootStore;
    return TOKENS_LIST.map((t) => {
      const balance = accountStore.findBalanceByAssetId(t.assetId);
      return balance ?? new Balance(t);
    })
      .filter((v) => v.usdEquivalent != null && v.usdEquivalent.gt(0))
      .sort((a, b) => {
        if (a.usdEquivalent == null && b.usdEquivalent == null) return 0;
        if (a.usdEquivalent == null && b.usdEquivalent != null) return 1;
        if (a.usdEquivalent == null && b.usdEquivalent == null) return -1;
        return a.usdEquivalent!.lt(b.usdEquivalent!) ? 1 : -1;
      });
  }

  serialize = (): ISerializedAccountStore => ({
    address: this.address,
    loginType: this.loginType,
    privateKey: this.privateKey,
  });

  login = async (loginType: LOGIN_TYPE, phrase?: string) => {
    this.setLoginType(loginType);
    switch (loginType) {
      case LOGIN_TYPE.FUEL_WALLET:
      case LOGIN_TYPE.FUELET:
        await this.loginWithFuelWallet();
        await this.onFuelLoaded();
        break;
      case LOGIN_TYPE.PRIVATE_KEY:
        await this.loginWithPrivateKey(phrase);
        break;
      default:
        return;
    }
  };
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

  loginWithFuelWallet = async () => {
    if (this.walletInstance == null)
      throw new Error("There is no wallet instance");
    const res = await this.walletInstance.connect({ url: NODE_URL });
    if (!res) {
      this.rootStore.notificationStore.toast("User denied", {
        type: "error",
      });
      return;
    }
    const account = await this.walletInstance.currentAccount();
    const provider = await this.walletInstance.getProvider();
    if (provider.url !== NODE_URL) {
      this.rootStore.notificationStore.toast(
        `Please change network url to beta 3`,
        {
          link: NODE_URL,
          linkTitle: "Go to Beta 3",
          type: "error",
          title: "Attention",
        }
      );
    }
    this.setAddress(account);
  };

  getFormattedBalance = (token: IToken): string | null => {
    const balance = this.findBalanceByAssetId(token.assetId);
    if (balance == null) return null;
    return BN.formatUnits(balance.balance ?? BN.ZERO, token.decimals).toFormat(
      4
    );
  };
  getBalance = (token: IToken): BN | null => {
    const balance = this.findBalanceByAssetId(token.assetId);
    if (balance == null) return null;
    return balance.balance ?? BN.ZERO;
  };

  get isLoggedIn() {
    return this.address != null;
  }

  loginWithPrivateKey = (key?: string) => {
    if (key == null) return;
    const wallet = Wallet.fromPrivateKey(key, NODE_URL);
    this.setAddress(wallet.address.toAddress());
    this.setPrivateKey(key);
    this.rootStore.settingsStore.setLoginModalOpened(false);
  };

  getWallet = async (): Promise<WalletLocked | WalletUnlocked | null> => {
    if (this.address == null) return null;
    switch (this.loginType) {
      case LOGIN_TYPE.FUEL_WALLET:
      case LOGIN_TYPE.FUELET:
        return this.walletInstance.getWallet(this.address);
      case LOGIN_TYPE.PRIVATE_KEY:
        if (this.privateKey == null) return null;
        return Wallet.fromPrivateKey(this.privateKey, new Provider(NODE_URL));
    }
    return null;
  };

  get walletToRead(): WalletLocked | null {
    if (this.address == null) return null;
    return Wallet.fromAddress(this.address, new Provider(NODE_URL));
  }

  get ethFormatWallet(): string | null {
    if (this.address == null) return null;
    return Address.fromString(this.address).toB256();
  }

  get addressInput(): null | { value: string } {
    if (this.address == null) return null;
    return { value: Address.fromString(this.address).toB256() };
  }
}

export default AccountStore;
