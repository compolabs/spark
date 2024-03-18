import { Contract, JsonRpcProvider } from "ethers";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import { SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import BN from "@src/utils/BN";

import { BlockchainNetwork } from "../abstract/BlockchainNetwork";
import { NETWORK_ERROR, NetworkError } from "../NetworkError";
import { FetchOrdersParams, FetchTradesParams, MarketCreateEvent, NETWORK, SpotMarketVolume } from "../types";

import { ERC20_ABI } from "./abi";
import { Api } from "./Api";
import { NETWORKS, PROVIDERS, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL, TOKENS_LIST } from "./constants";
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

  getPrivateKey = (): Nullable<string> => {
    return this.walletManager.privateKey;
  };

  getIsExternalWallet = () => {
    return this.walletManager.isRemoteProvider;
  };

  getBalance = async (accountAddress: EvmAddress, assetAddress: EvmAddress): Promise<string> => {
    if (assetAddress === this.getTokenBySymbol("ETH").assetId) {
      const balance = await this.provider.getBalance(accountAddress);
      return balance.toString();
    }

    const contract = new Contract(assetAddress, ERC20_ABI, this.provider);
    const balance = await contract.balanceOf(accountAddress);
    return balance.toString();
  };

  getTokenList = (): Token[] => {
    return TOKENS_LIST;
  };

  getTokenBySymbol = (symbol: string): Token => {
    return TOKENS_BY_SYMBOL[symbol];
  };

  getTokenByAssetId = (assetId: EvmAddress): Token => {
    return TOKENS_BY_ASSET_ID[assetId.toLowerCase()];
  };

  connectWallet = async (): Promise<void> => {
    await this.walletManager.connect(this.network);
  };

  connectWalletByPrivateKey = async (privateKey: string): Promise<void> => {
    await this.walletManager.connectByPrivateKey(privateKey, this.network);
  };

  disconnectWallet = (): void => {
    this.walletManager.disconnect();
  };

  addAssetToWallet = async (assetId: EvmAddress): Promise<void> => {
    await this.walletManager.addAsset(assetId);
  };

  createOrder = async (assetAddress: EvmAddress, size: string, price: string): Promise<string> => {
    if (!this.walletManager.signer) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_SIGNER);
    }

    return this.api.createOrder(assetAddress, size, price, this.walletManager.signer);
  };

  cancelOrder = async (orderId: string): Promise<void> => {
    if (!this.walletManager.signer) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_SIGNER);
    }

    await this.api.cancelOrder(orderId, this.walletManager.signer);
  };

  mintToken = async (assetAddress: EvmAddress): Promise<void> => {
    if (!this.walletManager.signer) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_SIGNER);
    }

    await this.api.mintToken(assetAddress, this.walletManager.signer);
  };

  approve = async (assetAddress: EvmAddress, amount: string): Promise<void> => {
    if (!this.walletManager.signer) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_SIGNER);
    }

    await this.api.approve(assetAddress, amount, this.walletManager.signer);
  };

  allowance = async (assetAddress: EvmAddress): Promise<string> => {
    if (!this.walletManager.signer) {
      throw new NetworkError(NETWORK_ERROR.UNKNOWN_SIGNER);
    }

    return this.api.allowance(assetAddress, this.walletManager.signer);
  };

  fetchMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
    return this.api.fetch.fetchMarkets(limit);
  };
  fetchMarketPrice = async (baseTokenAddress: EvmAddress): Promise<BN> => {
    return this.api.fetch.fetchMarketPrice(baseTokenAddress);
  };
  fetchOrders = async (params: FetchOrdersParams<EvmAddress>): Promise<SpotMarketOrder[]> => {
    return this.api.fetch.fetchOrders(params);
  };
  fetchTrades = async (params: FetchTradesParams<EvmAddress>): Promise<SpotMarketTrade[]> => {
    return this.api.fetch.fetchTrades(params);
  };
  fetchVolume = async (): Promise<SpotMarketVolume> => {
    return this.api.fetch.fetchVolume();
  };
}
