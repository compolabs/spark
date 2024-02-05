import axios from "axios";

import { SpotMarketOrder } from "@src/entity";
import BN from "@src/utils/BN";

const API_URL = "https://api.studio.thegraph.com/query/63182/arbitrum-sepolia-spot-market/version/latest";

type TOrderResponse = {
  id: string;
  baseToken: string;
  trader: string;
  baseSize: number;
  orderPrice: number;
  blockTimestamp: number;
};

type TFetchOrdersParams = {
  baseToken: string;
  type?: "BUY" | "SELL";
  limit: number;
  trader?: string;
};

export async function fetchOrders(params: TFetchOrdersParams): Promise<Array<SpotMarketOrder>> {
  const { baseToken, type, limit, trader } = params;
  const baseSizeFilter = type ? `baseSize_${type === "BUY" ? "gt" : "lt"}: 0,` : "";
  const traderFilter = trader ? `trader: "${trader.toLowerCase()}",` : "";
  const filter = `first: ${limit}, where: { baseToken: "${baseToken}", ${baseSizeFilter} ${traderFilter}}`;
  //todo add isActive
  const query = `
   		query {
   			orders(${filter}) {
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
    const response = await axios.post(API_URL, { query });
    return response.data.data.orders.map((order: TOrderResponse) => new SpotMarketOrder(order));
  } catch (error) {
    console.error("Error during Orders request:", error);
    return [];
  }
}

export type TMarketCreateEvent = {
  id: string;
  assetId: string;
  decimal: number;
};

export async function fetchMarketCreateEvents(limit: number): Promise<Array<TMarketCreateEvent>> {
  const filter = `first: ${limit}`;
  const query = `
    	query {
    	  marketCreateEvents(${filter}) {
    	    id
    	    assetId
    	    decimal
    	  }
    	}
  `;

  try {
    const response = await axios.post(API_URL, { query });
    return response.data.data.marketCreateEvents as TMarketCreateEvent[];
  } catch (error) {
    console.error("Error during MarketCreateEvents request:", error);
    return [];
  }
}

export async function fetchMarketPrice(baseToken: string): Promise<BN> {
  const filter = `first: 1, where: {baseToken: "${baseToken}"}`;
  const query = `
		query {
			tradeEvents(${filter}) {
    			price
			}
		}
`;
  try {
    const response = await axios.post(API_URL, { query });
    const tradeEvents = response.data.data.tradeEvents;
    return tradeEvents.length > 0 ? new BN(tradeEvents[0].price) : BN.ZERO;
  } catch (error) {
    console.error("Error during Trades request:", error);
    return BN.ZERO;
  }
}

export type TSpotMarketTrade = {
  id: string;
  baseToken: string;
  matcher: string;
  tradeAmount: BN;
  price: BN;
  timestamp: number;
};

export async function fetchTrades(baseToken: string, limit: number): Promise<Array<TSpotMarketTrade>> {
  const filter = `first: ${limit}, where: {baseToken: "${baseToken}"}`;
  const query = `
		query {
			tradeEvents(${filter}) {
    			id
    			matcher
    			baseToken
    			tradeAmount
    			price
    			blockTimestamp
			}
		}
`;
  try {
    const response = await axios.post(API_URL, { query });
    return response.data.data.tradeEvents.map((trade: any) => ({
      ...trade,
      tradeAmount: new BN(trade.tradeAmount),
      price: new BN(trade.price),
      timestamp: trade.blockTimestamp,
    }));
  } catch (error) {
    console.error("Error during Trades request:", error);
    return [];
  }
}
