import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import { Address, Provider, Wallet, WalletLocked, WalletUnlocked } from "fuels";
import { NODE_URL } from "@src/constants";

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
  private _provider?: Provider;
  public get provider(){
    return this._provider!
  }
  constructor(rootStore: RootStore, initState?: ISerializedAccountStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
    Provider.create(NODE_URL).then(provider => this._provider = provider)
    if (initState) {
      this.setLoginType(initState.loginType);
      this.setAddress(initState.address);
      if (initState.loginType != null) {
        document.addEventListener("FuelLoaded", this.onFuelLoaded);
      }
    }
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
    await this.loginWithWallet();
    await this.onFuelLoaded();
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
      this.rootStore.notificationStore.toast(`Please change network url to beta 4`);
    }
    this.setAddress(account);
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
