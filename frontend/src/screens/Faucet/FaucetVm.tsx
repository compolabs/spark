import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import { EXPLORER_URL, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL, TOKENS_LIST } from "@src/constants";
import BN from "@src/utils/BN";
import { TokenContractAbi__factory } from "@src/contracts";
import { LOGIN_TYPE } from "@stores/AccountStore";
import { Asset } from "@fuel-wallet/types";

const ctx = React.createContext<FaucetVM | null>(null);

interface IProps {
  children: React.ReactNode;
}

export const FaucetVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new FaucetVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useFaucetVM = () => useVM(ctx);

const faucetAmounts: Record<string, number> = {
  ETH: 0.5,
  LINK: 50,
  UNI: 50,
  BTC: 0.01,
  USDC: 300,
  SWAY: 5,
  COMP: 5,
};

class FaucetVM {
  public rootStore: RootStore;

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  alreadyMintedTokens: string[] = [];
  private setAlreadyMintedTokens = (l: string[]) => (this.alreadyMintedTokens = l);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.checkTokensThatAlreadyBeenMinted();
    reaction(
      () => [this.rootStore.accountStore.address],
      () => this.updateFaucetStateWhenVersionChanged()
    );
    makeAutoObservable(this);
  }

  updateFaucetStateWhenVersionChanged = async () => {
    this.setInitialized(false);
    await this.checkTokensThatAlreadyBeenMinted();
    this.setInitialized(true);
  };

  rejectUpdateStatePromise?: () => void;
  setRejectUpdateStatePromise = (v: any) => (this.rejectUpdateStatePromise = v);

  checkTokensThatAlreadyBeenMinted = async () => {
    const { walletToRead, addressInput } = this.rootStore.accountStore;
    if (walletToRead == null || addressInput == null) return;
    const tokens = TOKENS_LIST.filter((v) => v.symbol !== "ETH");
    if (this.rejectUpdateStatePromise != null) this.rejectUpdateStatePromise();

    const tokensContracts = tokens.map((b) =>
      TokenContractAbi__factory.connect(b.assetId, walletToRead)
    );
    const promise = new Promise((resolve, reject) => {
      this.rejectUpdateStatePromise = reject;
      resolve(
        Promise.all(tokensContracts.map((v) => v.functions.already_minted(addressInput).simulate()))
      );
    });
    promise
      .catch((v) => {
        console.log("update faucet data error", v);
      })
      .then((value: any) => {
        if (value.length > 0) {
          const v = value.reduce(
            (acc: any, v: any, index: number) =>
              v.value ? [...acc, tokens[index].assetId] : [...acc],
            [] as string[]
          );
          this.setAlreadyMintedTokens(v);
        }
      })
      .finally(() => {
        this.setInitialized(true);
        this.setRejectUpdateStatePromise(undefined);
      });
  };

  actionTokenAssetId: string | null = null;
  setActionTokenAssetId = (l: string | null) => (this.actionTokenAssetId = l);

  initialized: boolean = false;
  private setInitialized = (l: boolean) => (this.initialized = l);

  get faucetTokens() {
    const { accountStore } = this.rootStore;
    if (accountStore.assetBalances == null) return [];
    return TOKENS_LIST.map((b) => {
      const balance = accountStore.findBalanceByAssetId(b.assetId);
      const mintAmount = new BN(faucetAmounts[b.symbol] ?? 0);
      const formatBalance = BN.formatUnits(balance?.balance ?? BN.ZERO, b.decimals);
      return {
        ...TOKENS_BY_ASSET_ID[b.assetId],
        ...balance,
        formatBalance,
        mintAmount,
      };
    });
  }

  mint = async (assetId?: string) => {
    if (assetId == null || this.alreadyMintedTokens.includes(assetId)) {
      return;
    }
    if (this.rootStore.accountStore.loginType === LOGIN_TYPE.FUEL_WALLET) {
      const addedAssets: Array<Asset> = await window?.fuel.assets();
      if (addedAssets != null && !addedAssets.some((v) => v.assetId === assetId)) {
        await this.addAsset(assetId);
      }
    }
    this._setLoading(true);
    this.setActionTokenAssetId(assetId);
    const { accountStore, notificationStore } = this.rootStore;
    const wallet = await accountStore.getWallet();
    if (wallet == null) return;
    const tokenContract = TokenContractAbi__factory.connect(assetId, wallet);

    try {
      const { transactionResult } = await tokenContract.functions
        .mint()
        .txParams({ gasPrice: 1 })
        .call();
      if (transactionResult != null) {
        this.setAlreadyMintedTokens([...this.alreadyMintedTokens, assetId]);
        const token = TOKENS_BY_ASSET_ID[assetId];
        this.rootStore.notificationStore.toast(`You have successfully minted ${token.symbol}`, {
          link: `${EXPLORER_URL}/transaction/${transactionResult.id}`,
          linkTitle: "View on Explorer",
          type: "success",
          title: "Transaction is completed!",
        });
      }
      await this.rootStore.accountStore.updateAccountBalances();
    } catch (e) {
      const errorText = e?.toString();
      console.log(errorText);
      notificationStore.toast(errorText ?? "", { type: "error" });
    } finally {
      this.setActionTokenAssetId(null);
      this._setLoading(false);
    }
  };

  addAsset = async (assetId: string) => {
    if (assetId === TOKENS_BY_SYMBOL.ETH.assetId || window.fuel == null) return;
    const token = TOKENS_BY_ASSET_ID[assetId];
    const asset = {
      name: token.name,
      assetId: token.assetId,
      imageUrl: window.location.origin + token.logo,
      symbol: token.symbol,
      isCustom: true,
    };
    return window?.fuel.addAsset(asset);
  };
}
