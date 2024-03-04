import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { NETWORK } from "@src/blockchain/types";
import { ARBITRUM_SEPOLIA_FAUCET, FUEL_FAUCET } from "@src/constants";
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
    const { balanceStore, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    return bcNetwork!.getTokenList().map((v) => {
      const balance = balanceStore.getBalance(v.assetId);
      const mintAmount = new BN(FAUCET_AMOUNTS[v.symbol] ?? 0);
      const formatBalance = BN.formatUnits(balance ?? BN.ZERO, v.decimals);
      return {
        ...bcNetwork!.getTokenByAssetId(v.assetId),
        ...balance,
        formatBalance,
        mintAmount,
        disabled: !AVAILABLE_TOKENS.includes(v.symbol),
      };
    });
  }

  setActionTokenAssetId = (l: Nullable<string>) => (this.actionTokenAssetId = l);

  private mint = async (assetId: string) => {
    const { accountStore, balanceStore, notificationStore, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    if (!bcNetwork!.getTokenByAssetId(assetId) || !accountStore.address) return;

    this.setActionTokenAssetId(assetId);
    this.setLoading(true);

    try {
      await bcNetwork?.mintToken(assetId);
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
    const { accountStore, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;
    const token = bcNetwork?.getTokenByAssetId(assetId);

    if (!token || !accountStore.address) return;

    if (token.symbol === "ETH") {
      window.open(
        bcNetwork?.NETWORK_TYPE === NETWORK.EVM ? ARBITRUM_SEPOLIA_FAUCET : `${FUEL_FAUCET}${accountStore.address}`,
        "blank",
      );
      return;
    }

    this.mint(assetId);
  };

  disabled = (assetId: string) => {
    const { accountStore, faucetStore, blockchainStore } = this.rootStore;
    const bcNetwork = blockchainStore.currentInstance;

    const token = bcNetwork?.getTokenByAssetId(assetId);
    return (
      faucetStore.loading ||
      !faucetStore.initialized ||
      (token && token.symbol !== "ETH" && accountStore.address === null)
    );
  };

  private setLoading = (l: boolean) => (this.loading = l);
}

export default FaucetStore;
