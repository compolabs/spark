import axios from "axios";
import { SpotMarketOrder } from "../entity/SpotMarketOrder";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, NODE_URL, PRIVATE_KEY } from "../config";
import { SPOT_MARKET_ABI } from "../abi";
import { fetchIndexer } from "../utils/fetchIndexer";

type TOrderType = "BUY" | "SELL";
type TOrderResponse = {
  id: string;
  baseToken: string;
  trader: string;
  baseSize: number;
  orderPrice: number;
  blockTimestamp: number;
};

export class SpotMarket {
  contract: ethers.Contract;
  signer: ethers.Signer;

  constructor() {
    const provider = new ethers.JsonRpcProvider(NODE_URL);
    this.signer = new ethers.Wallet(PRIVATE_KEY, provider);

    this.signer
      .getAddress()
      .then(async (address) => ({
        balance: await provider.getBalance(address),
        address,
      }))
      .then(({ balance, address }) =>
        console.log(
          `🕺 Matcher address: ${address}\n   Balance: ${ethers.formatUnits(balance)} ETH\n`
        )
      );
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, SPOT_MARKET_ABI, this.signer);
  }

  getOrders = async (variables: { market: string; limit: number; type: TOrderType }) => {
    const query = `
    query {
      orders(
        first: ${variables.limit},
        orderBy: orderPrice,
        orderDirection: ${variables.type === "BUY" ? "desc" : "asc"}
        where: { 
          baseToken: "${variables.market.toLowerCase()}", 
          ${variables.type === "BUY" ? "baseSize_gt: 0" : "baseSize_lt: 0"}
        }
      ) {
        id
        trader
        baseToken
        baseSize
        orderPrice
        blockTimestamp
      }
    }
  `;
    try {
      const response = await fetchIndexer(query);
      return response.data.data.orders.map((order: TOrderResponse) => new SpotMarketOrder(order));
    } catch (error) {
      console.error("Error during Orders request:", error);
      return [];
    }
  };

  matchOrders = async (sellOrder: string, buyOrder: string) => {
    try {
      console.log(sellOrder, buyOrder);
      const tx = await this.contract.matchOrders(sellOrder, buyOrder);
      await tx.wait();

      console.log("✅ Orders matched:", sellOrder, buyOrder, "\n");
    } catch (error: any) {
      console.log("❌ Error matching orders:", error.toString(), "\n");
    }
  };
}
