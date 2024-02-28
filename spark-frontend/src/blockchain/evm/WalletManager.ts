import { ethers, JsonRpcSigner, NonceManager } from "ethers";
import { makeAutoObservable } from "mobx";
import { Nullable } from "tsdef";

import { TOKENS_BY_ASSET_ID } from "@src/constants";

import { Network, PROVIDERS } from "./constants";

export class WalletManager {
  public address: Nullable<string> = null;
  public signer: Nullable<ethers.JsonRpcSigner> = null;

  private privateKey: Nullable<string> = null;

  constructor() {
    makeAutoObservable(this);
  }

  connect = async (targetNetwork: Network): Promise<void> => {
    const ethereum = window.ethereum;

    if (!ethereum) {
      throw new Error("Ethereum wallet not found");
    }

    this.signer = await new ethers.BrowserProvider(ethereum).getSigner();
    const network = await this.signer.provider.getNetwork();
    const targetChainId = parseInt(targetNetwork.chainId, 10).toString(16);
    const currentChainId = parseInt(network.chainId.toString(), 10).toString(16);

    this.address = await this.signer.getAddress();

    if (currentChainId !== targetChainId) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${targetChainId}`,
            chainName: targetNetwork.name,
            rpcUrls: [targetNetwork.rpc],
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
          },
        ],
      });
    } else {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId}` }],
      });
    }
    const address = await this.signer.getAddress();

    this.address = address;
  };

  connectByPrivateKey = async (privateKey: string, network: Network): Promise<void> => {
    const wallet = new ethers.Wallet(privateKey, PROVIDERS[network.chainId]);
    const address = await wallet.getAddress();
    this.signer = new NonceManager(wallet) as any as JsonRpcSigner;
    this.address = address;
    this.privateKey = privateKey;
  };

  addAsset = async (assetId: string) => {
    // Не добавляем, если авторизированы по приватному ключу
    if (this.privateKey?.length) {
      return;
    }

    if (!this.address) {
      throw new Error("Not connected to a wallet.");
    }

    const token = TOKENS_BY_ASSET_ID[assetId];

    if (!token) {
      throw new Error("Invalid token.");
    }

    await window.ethereum?.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: assetId,
        },
      },
    });
  };

  disconnect = () => {
    this.address = null;
    this.signer = null;
    this.privateKey = null;
  };
}
