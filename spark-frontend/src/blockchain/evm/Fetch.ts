import axios from "axios";

import { INDEXER_URL, INDEXER_URLS } from "@src/constants";
import { SpotMarketOrder, SpotMarketTrade } from "@src/entity";
import BN from "@src/utils/BN";

import { FetchOrdersParams, FetchTradesParams, MarketCreateEvent, SpotMarketVolume } from "../types";

import { EvmAddress } from "./types";

type OrderResponse = {
  id: string;
  baseToken: EvmAddress;
  trader: EvmAddress;
  baseSize: number;
  orderPrice: number;
  blockTimestamp: number;
};

export class Fetch {
  fetchMarkets = async (limit: number): Promise<MarketCreateEvent[]> => {
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
      return response.data.data.marketCreateEvents as MarketCreateEvent[];
    } catch (error) {
      console.error("Error during MarketCreateEvents request:", error);
      return [];
    }
  };

  fetchMarketPrice = async (baseToken: EvmAddress): Promise<BN> => {
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
  };

  fetchOrders = async ({
    baseToken,
    type,
    limit,
    trader,
    isActive,
  }: FetchOrdersParams<EvmAddress>): Promise<SpotMarketOrder[]> => {
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
      return response.data.data.orders.map((order: OrderResponse) => new SpotMarketOrder(order));
    } catch (error) {
      console.error("Error during Orders request:", error);
      return [];
    }
  };

  fetchTrades = async ({ baseToken, limit, trader }: FetchTradesParams<EvmAddress>): Promise<SpotMarketTrade[]> => {
    const baseTokenFilter = `baseToken: "${baseToken}",`;
    const smartFilter = trader
      ? `or: [
      { seller: "${trader}", baseToken: "${baseToken}" },
      { buyer: "${trader}", baseToken: "${baseToken}" }
    ]`
      : "";
    const where = trader ? smartFilter : baseTokenFilter;
    const filter = `first: ${limit}, where: { ${where} }`;
    const query = `
      query {
        tradeEvents(${filter}) {
          id
          matcher
          seller
          buyer
          baseToken
          tradeAmount
          price
          blockTimestamp
        }
      }
  `;
    try {
      const response = await fetchIndexer(query);

      return response.data.data.tradeEvents.map(
        (trade: any) =>
          new SpotMarketTrade({
            ...trade,
            tradeAmount: new BN(trade.tradeAmount),
            price: new BN(trade.price),
            timestamp: trade.blockTimestamp,
            userAddress: trader,
          }),
      );
    } catch (error) {
      console.error("Error during Trades request:", error);
      return [];
    }
  };

  fetchVolume = async (): Promise<SpotMarketVolume> => {
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

      const formattedData = data.map((v) => ({
        tradeAmount: new BN(v.tradeAmount),
        price: new BN(v.price),
      }));

      const arrayOfPrice = formattedData.map((v) => v.price);

      const low = BN.min(...arrayOfPrice);
      const high = BN.max(...arrayOfPrice);
      const volume = formattedData.reduce((acc, curr) => curr.tradeAmount.plus(acc), BN.ZERO);

      return { volume, high, low };
    } catch (error) {
      console.error("Error during Trades request:", error);

      return { volume: BN.ZERO, high: BN.ZERO, low: BN.ZERO };
    }
  };
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
