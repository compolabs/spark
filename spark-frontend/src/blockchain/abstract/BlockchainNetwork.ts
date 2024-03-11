import { Nullable } from "tsdef";

import { SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import BN from "@src/utils/BN";

import { FetchOrdersParams, FetchTradesParams, MarketCreateEvent, NETWORK, SpotMarketVolume } from "../types";

export abstract class BlockchainNetwork {
  abstract NETWORK_TYPE: NETWORK;

  abstract getBalance(accountAddress: string, assetAddress: string): Promise<string>;
  abstract getAddress(): Nullable<string>;
  abstract getPrivateKey(): Nullable<string>;
  abstract getIsExternalWallet(): boolean;

  // Tokens
  abstract getTokenList(): Token[];
  abstract getTokenBySymbol(symbol: string): Token;
  abstract getTokenByAssetId(assetId: string): Token;

  // Wallet
  abstract connectWallet(): Promise<void>;
  abstract connectWalletByPrivateKey(privateKey: string): Promise<void>;
  abstract disconnectWallet(): void;
  abstract addAssetToWallet(assetId: string): Promise<void>;

  // Api Contract
  abstract createOrder(assetAddress: string, size: string, price: string): Promise<string>;
  abstract cancelOrder(orderId: string): Promise<void>;
  abstract mintToken(assetAddress: string): Promise<void>;
  abstract approve(assetAddress: string, amount: string): Promise<void>;
  abstract allowance(assetAddress: string): Promise<string>;

  // Api Fetch
  abstract fetchMarkets(limit: number): Promise<MarketCreateEvent[]>;
  abstract fetchMarketPrice(baseTokenAddress: string): Promise<BN>;
  abstract fetchOrders(params: FetchOrdersParams): Promise<SpotMarketOrder[]>;
  abstract fetchTrades(params: FetchTradesParams): Promise<SpotMarketTrade[]>;
  abstract fetchVolume(): Promise<SpotMarketVolume>;
}
