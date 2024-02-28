import { ethers, JsonRpcSigner } from "ethers";

import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { FAUCET_AMOUNTS } from "@src/stores/FaucetStore";

import { ERC20_ABI, SPOT_MARKET_ABI } from "./abi";
import { CONTRACT_ADDRESSES } from "./constants";
import { EvmAddress } from "./types";

export class Api {
  createOrder = async (
    assetAddress: EvmAddress,
    size: string,
    price: string,
    signer: JsonRpcSigner,
  ): Promise<string> => {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.spotMarket, SPOT_MARKET_ABI, signer);
    const tx = await contract.openOrder(assetAddress, size, price);
    await tx.wait();
    return tx.hash;
  };

  cancelOrder = async (orderId: string, signer: JsonRpcSigner): Promise<void> => {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.spotMarket, SPOT_MARKET_ABI, signer);
    const tx = await contract.removeOrder(orderId);
    await tx.wait();
  };

  mintToken = async (assetAddress: EvmAddress, signer: JsonRpcSigner): Promise<void> => {
    const token = TOKENS_BY_ASSET_ID[assetAddress];
    const contract = new ethers.Contract(assetAddress, ERC20_ABI, signer);

    const amount = ethers.parseUnits(FAUCET_AMOUNTS[token.symbol].toString(), token.decimals);

    const address = await signer.getAddress();
    const tx = await contract.mint(address, amount);
    await tx.wait();
  };

  approve = async (assetAddress: EvmAddress, amount: string, signer: JsonRpcSigner): Promise<void> => {
    const contract = new ethers.Contract(assetAddress, ERC20_ABI, signer);
    const tx = await contract.approve(CONTRACT_ADDRESSES.spotMarket, amount);
    await tx.wait();
  };

  allowance = async (assetAddress: EvmAddress, signer: JsonRpcSigner): Promise<string> => {
    const contract = new ethers.Contract(assetAddress, ERC20_ABI, signer);
    const address = await signer.getAddress();
    const allowance = await contract.allowance(address, CONTRACT_ADDRESSES.spotMarket);
    return allowance.toString();
  };
}
