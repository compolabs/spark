import { Contract, JsonRpcProvider } from "ethers";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import { TOKENS_BY_SYMBOL } from "@src/constants";

import { BlockchainNetwork } from "../abstract/BlockchainNetwork";
import { NETWORK } from "../types";

import { ERC20_ABI } from "./abi";
import { Api } from "./Api";
import { NETWORKS, PROVIDERS } from "./constants";
import { EvmAddress } from "./types";
import { WalletManager } from "./WalletManager";

export class EVMNetwork extends BlockchainNetwork {
  NETWORK_TYPE = NETWORK.EVM;

  private provider: JsonRpcProvider;

  private walletManager = new WalletManager();
  private api = new Api();

  public network = NETWORKS[0];

  constructor() {
    super();

    makeObservable(this.walletManager);

    this.provider = PROVIDERS[this.network.chainId];
  }

  getAddress = (): Nullable<string> => {
    return this.walletManager.address;
  };

  getBalance = async (accountAddress: string, assetAddress: EvmAddress): Promise<string> => {
    if (assetAddress === TOKENS_BY_SYMBOL.ETH.assetId) {
      const balance = await this.provider.getBalance(accountAddress);
      return balance.toString();
    }

    const contract = new Contract(assetAddress, ERC20_ABI, this.provider);
    const balance = await contract.balanceOf(accountAddress);
    return balance.toString();
  };

  connectWallet = async (): Promise<void> => {
    this.walletManager.connect(this.network);
  };

  connectWalletByPrivateKey = async (privateKey: string): Promise<void> => {
    this.walletManager.connectByPrivateKey(privateKey, this.network);
  };

  disconnectWallet = (): void => {
    this.walletManager.disconnect();
  };

  addAssetToWallet = async (assetId: string): Promise<void> => {
    await this.walletManager.addAsset(assetId);
  };

  createOrder = async (assetAddress: EvmAddress, size: string, price: string): Promise<string> => {
    if (!this.walletManager.signer) {
      throw new Error("Signer does not exist.");
    }

    return this.api.createOrder(assetAddress, size, price, this.walletManager.signer);
  };

  cancelOrder = async (orderId: string): Promise<void> => {
    if (!this.walletManager.signer) {
      throw new Error("Signer does not exist.");
    }

    await this.api.cancelOrder(orderId, this.walletManager.signer);
  };

  mintToken = async (assetAddress: EvmAddress): Promise<void> => {
    if (!this.walletManager.signer) {
      throw new Error("Signer does not exist.");
    }

    await this.api.mintToken(assetAddress, this.walletManager.signer);
  };

  approve = async (assetAddress: EvmAddress, amount: string): Promise<void> => {
    if (!this.walletManager.signer) {
      throw new Error("Signer does not exist.");
    }

    await this.api.approve(assetAddress, amount, this.walletManager.signer);
  };

  allowance = async (assetAddress: EvmAddress): Promise<string> => {
    if (!this.walletManager.signer) {
      throw new Error("Signer does not exist.");
    }

    return this.api.allowance(assetAddress, this.walletManager.signer);
  };
}
