import RootStore from "@stores/RootStore";
import { makeAutoObservable, reaction } from "mobx";
import { Address, Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";
import { IToken, NODE_URL, TOKENS_LIST } from "@src/constants";
import Balance from "@src/entities/Balance";
import BN from "@src/utils/BN";

export enum LOGIN_TYPE {
  FUEL_WALLET = "FUEL_WALLET",
  FUELET = "FUELET",
}

export interface ISerializedAccountStore {
  address: string | null;
  loginType: LOGIN_TYPE | null;
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
      if (initState.loginType != null) {
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

  handleNetworkEvent = (network: any) => {
    if (network.url !== NODE_URL) {
      this.rootStore.notificationStore.toast(
        `Please change network url to Testnet Beta 4`,
        {
          // copyTitle: "Copy beta-4 RPC",
          // copyText: NODE_URL,
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
  });

  login = async (loginType: LOGIN_TYPE) => {
    this.setLoginType(loginType);
    await this.loginWithWallet();
    await this.onFuelLoaded();
  };

  get walletInstance() {
    switch (this.loginType) {
      case LOGIN_TYPE.FUEL_WALLET:
        return window.fuel;
      case LOGIN_TYPE.FUELET:
        return window.fuel;
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
    if (this.walletInstance == null)
      throw new Error("There is no wallet instance");
    // const res = await this.walletInstance.connect({ url: NODE_URL });
    const res = await this.walletInstance.connect();
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
        `Please change network url to beta 4`,
        {
          // copyTitle: "Copy beta-4 RPC",
          // copyText: NODE_URL,
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
      2
    );
  };
  getBalance = (token: IToken): BN | null => {
    const balance = this.findBalanceByAssetId(token.assetId);
    if (balance == null) return null;
    return BN.formatUnits(balance.balance ?? BN.ZERO, token.decimals);
  };

  get isLoggedIn() {
    return this.address != null;
  }

  getWallet = async (): Promise<WalletLocked | WalletUnlocked | null> => {
    if (this.address == null || window.fuel == null) return null;
    return window.fuel.getWallet(this.address);
  };

  get walletToRead(): WalletLocked {
    //just acc with eth on balance
    return Wallet.fromAddress(
      "fuel1m56y48mej3366h6460y4rvqqt62y9vn8ad3meyfa5wkk5dc6mxmss7rwnr",
      this.provider
    );
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
