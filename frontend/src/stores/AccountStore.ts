import RootStore from "@stores/RootStore";
import { makeAutoObservable, reaction } from "mobx";
import { Address, Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";
import { IToken, NODE_URL, ROUTES, TOKENS_LIST } from "@src/constants";
import Balance from "@src/entities/Balance";
import BN from "@src/utils/BN";
import { Mnemonic } from "@fuel-ts/mnemonic";
import { FuelProviderConfig } from "@fuel-wallet/sdk";

export enum LOGIN_TYPE {
  FUEL_WALLET = "FUEL_WALLET",
  GENERATE_FROM_SEED = "GENERATE_FROM_SEED",
  PASTE_SEED = "PASTE_SEED",
}

export interface ISerializedAccountStore {
  address: string | null;
  loginType: LOGIN_TYPE | null;
  mnemonicPhrase: string | null;
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
      this.setMnemonicPhrase(initState.mnemonicPhrase);
      if (initState.loginType === LOGIN_TYPE.FUEL_WALLET) {
        document.addEventListener("FuelLoaded", this.onFuelLoaded);
      }
    }
    this.updateAccountBalances().then();
    setInterval(this.updateAccountBalances, 60 * 1000);
    reaction(
      () => this.address,
      () => Promise.all([this.updateAccountBalances()])
    );
  }

  onFuelLoaded = () => {
    if (window.fuel == null) return;
    window?.fuel?.on(window?.fuel.events.currentAccount, this.handleAccEvent);
    window?.fuel?.on(window?.fuel.events?.network, this.handleNetworkEvent);
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

  public mnemonicPhrase: string | null = null;
  setMnemonicPhrase = (seed: string | null) => (this.mnemonicPhrase = seed);

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
    mnemonicPhrase: this.mnemonicPhrase,
  });

  login = async (loginType: LOGIN_TYPE, phrase?: string) => {
    this.setLoginType(loginType);
    switch (loginType) {
      case LOGIN_TYPE.FUEL_WALLET:
        await this.loginWithFuelWallet();
        await this.onFuelLoaded();
        break;
      case LOGIN_TYPE.GENERATE_FROM_SEED:
      case LOGIN_TYPE.PASTE_SEED:
        await this.loginWithMnemonicPhrase(phrase);
        break;
      default:
        return;
    }
  };
  disconnect = async () => {
    if (this.loginType === LOGIN_TYPE.FUEL_WALLET) {
      await window.fuel.disconnect();
    }
    this.setAddress(null);
    this.setMnemonicPhrase(null);
    this.setLoginType(null);
  };

  loginWithFuelWallet = async () => {
    const fuel = window.fuel;
    const res = await fuel?.connect({ url: NODE_URL });
    if (!res) {
      this.rootStore.notificationStore.toast("User denied", {
        type: "error",
      });
      return;
    }
    const account = await window.fuel.currentAccount();
    const provider = await fuel.getProvider();
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

  loginWithMnemonicPhrase = (mnemonicPhrase?: string) => {
    const mnemonic =
      mnemonicPhrase == null ? Mnemonic.generate(16) : mnemonicPhrase;
    const seed = Mnemonic.mnemonicToSeed(mnemonic);
    const wallet = Wallet.fromPrivateKey(seed, NODE_URL);
    this.setAddress(wallet.address.toAddress());
    this.setMnemonicPhrase(mnemonic);
    this.rootStore.settingsStore.setLoginModalOpened(false);
    if (mnemonicPhrase == null) {
      this.rootStore.notificationStore.toast("First you need to mint ETH", {
        link: `${window.location.origin}/#${ROUTES.FAUCET}`,
        linkTitle: "Go to Faucet",
        type: "info",
        title: "Attention",
      });
    }
  };

  getWallet = async (): Promise<WalletLocked | WalletUnlocked | null> => {
    if (this.address == null) return null;
    switch (this.loginType) {
      case LOGIN_TYPE.FUEL_WALLET:
        return window.fuel?.getWallet(this.address);
      case LOGIN_TYPE.GENERATE_FROM_SEED:
      case LOGIN_TYPE.PASTE_SEED:
        if (this.mnemonicPhrase == null) return null;
        const seed = Mnemonic.mnemonicToSeed(this.mnemonicPhrase);
        return Wallet.fromPrivateKey(seed, new Provider(NODE_URL));
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

  isWavesKeeperInstalled = false;
  setWavesKeeperInstalled = (state: boolean) =>
    (this.isWavesKeeperInstalled = state);
}

export default AccountStore;
