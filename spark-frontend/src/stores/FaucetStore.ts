import { ethers } from "ethers";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { ERC20_ABI } from "@src/abi";
import { ARBITRUM_SEPOLIA_FAUCET, TOKENS_BY_ASSET_ID, TOKENS_LIST } from "@src/constants";
import BN from "@src/utils/BN";
import { handleEvmErrors } from "@src/utils/handleEvmErrors";
import RootStore from "@stores/RootStore";

export const FAUCET_AMOUNTS: Record<string, number> = {
  ETH: 0.001,
  USDC: 3000,
  BTC: 0.01,
  UNI: 50,
};
const AVAILABLE_TOKENS = ["ETH", "UNI", "USDC"];

class FaucetStore {
  public rootStore: RootStore;

  loading: boolean = false;
  actionTokenAssetId: Nullable<string> = null;
  initialized: boolean = true;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get faucetTokens() {
    const { balanceStore } = this.rootStore;

    return TOKENS_LIST.map((v) => {
      const balance = balanceStore.getBalance(v.assetId);
      const mintAmount = new BN(FAUCET_AMOUNTS[v.symbol] ?? 0);
      const formatBalance = BN.formatUnits(balance ?? BN.ZERO, v.decimals);
      return {
        ...TOKENS_BY_ASSET_ID[v.assetId],
        ...balance,
        formatBalance,
        mintAmount,
        disabled: !AVAILABLE_TOKENS.includes(v.symbol),
      };
    });
  }

  setActionTokenAssetId = (l: Nullable<string>) => (this.actionTokenAssetId = l);

  private mint = async (assetId: string) => {
    const { accountStore, balanceStore, notificationStore } = this.rootStore;

    if (!TOKENS_BY_ASSET_ID[assetId] || !accountStore.address) return;

    this.setActionTokenAssetId(assetId);

    const token = TOKENS_BY_ASSET_ID[assetId];
    const tokenContract = new ethers.Contract(assetId, ERC20_ABI, accountStore.signer);

    const amount = ethers.parseUnits(FAUCET_AMOUNTS[token.symbol].toString(), token.decimals);
    try {
      this.setLoading(true);
      const tx = await tokenContract.mint(accountStore.getAddress(), amount);
      await tx.wait();
      notificationStore.toast("Minting successful!", { type: "success" });
      await accountStore.addAsset(assetId);
    } catch (error: any) {
      handleEvmErrors(notificationStore, error, "We were unable to mint tokens at this time");
    } finally {
      this.setLoading(false);
      await balanceStore.update();
    }
  };

  mintByAssetId = (assetId: string) => {
    const { accountStore } = this.rootStore;
    const token = TOKENS_BY_ASSET_ID[assetId];

    if (!token || !accountStore.address) return;

    if (token.symbol === "ETH") {
      window.open(`${ARBITRUM_SEPOLIA_FAUCET}/?address=${accountStore.address}`, "blank");
      return;
    }

    this.mint(assetId);
  };

  disabled = (assetId: string) => {
    const token = TOKENS_BY_ASSET_ID[assetId];
    const { accountStore, faucetStore } = this.rootStore;
    return (
      faucetStore.loading ||
      !faucetStore.initialized ||
      (token && token.symbol !== "ETH" && accountStore.address === null)
    );
  };

  private setLoading = (l: boolean) => (this.loading = l);
}

export default FaucetStore;
