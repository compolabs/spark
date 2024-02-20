import axios from "axios";

import { INDEXER_URL, INDEXER_URLS } from "@src/constants";
import { SpotMarketOrder } from "@src/entity";
import BN from "@src/utils/BN";

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
  isActive?: boolean;
};

export async function fetchOrders({
  baseToken,
  type,
  limit,
  trader,
  isActive,
}: TFetchOrdersParams): Promise<Array<SpotMarketOrder>> {
  const baseSizeFilter = type ? `baseSize_${type === "BUY" ? "gt" : "lt"}: 0,` : "";
  const traderFilter = trader ? `trader: "${trader.toLowerCase()}",` : "";
  const baseTokenFilter = `baseToken: "${baseToken}",`;
  const isActiveFilter = isActive !== undefined ? `isActive: ${isActive},` : "";
  const filter = `first: ${limit}, where: { ${baseTokenFilter} ${baseSizeFilter} ${traderFilter} ${isActiveFilter}}`;

  const query = `
    query {
      orders(${filter}) {
        id
        trader
        baseToken
        baseSize
        orderPrice
        blockTimestamp
        isActive
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
        }
      }
  `;

  try {
    const response = await fetchIndexer(query);
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
    const response = await fetchIndexer(query);
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
    const response = await fetchIndexer(query);
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

export type SpotMarketVolume = {
  low: BN;
  high: BN;
  volume: BN;
};

export async function fetchVolumeData(): Promise<SpotMarketVolume> {
  const now = Date.now();
  const startTime = Math.floor((now - 24 * 60 * 60 * 1000) / 1000);
  const filter = `where: {blockTimestamp_gte: ${startTime}}`;

  const query = `
  query {
    tradeEvents(${filter}) {
      tradeAmount
      price
    }
  }`;

  try {
    const response = await fetchIndexer(query);
    const data = response.data.data.tradeEvents as { tradeAmount: string; price: string }[];

    const volume = data.reduce((acc: number, curr) => acc + parseFloat(curr.tradeAmount), 0);
    const high = data.reduce((max, trade) => (trade.price > max ? trade.price : max), data[0].price);
    const low = data.reduce((min, trade) => (trade.price < min ? trade.price : min), data[0].price);

    return { volume: new BN(volume), high: new BN(high), low: new BN(low) };
  } catch (error) {
    console.error("Error during Trades request:", error);

    return { volume: BN.ZERO, high: BN.ZERO, low: BN.ZERO };
  }
}

const fetchIndexer = async (query: string) => {
  for (const i in INDEXER_URLS) {
    const indexer = INDEXER_URLS[i];
    try {
      return await axios.post(indexer, { query });
    } catch (error) {
      /*eslint-disable-next-line */
    }
  }
  return await axios.post(INDEXER_URL, { query });
};
