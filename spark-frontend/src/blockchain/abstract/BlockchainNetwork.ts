import { Nullable } from "tsdef";

export abstract class BlockchainNetwork {
  abstract getBalance(accountAddress: string, assetAddress: string): Promise<string>;
  abstract getAddress(): Nullable<string>;

  // Wallet
  abstract connectWallet(): Promise<void>;
  abstract connectWalletByPrivateKey(privateKey: string): Promise<void>;
  abstract disconnectWallet(): void;

  // Api
  abstract createOrder(assetAddress: string, size: string, price: string): Promise<string>;
  abstract cancelOrder(orderId: string): Promise<void>;
  abstract mintToken(assetAddress: string): Promise<void>;
  abstract approve(assetAddress: string, amount: string): Promise<void>;
  abstract allowance(assetAddress: string): Promise<string>;
}
