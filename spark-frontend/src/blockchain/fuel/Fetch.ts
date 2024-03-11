import { Address, Bech32Address, WalletLocked, WalletUnlocked } from "fuels";

import { SpotMarketOrder, SpotMarketTrade, Token } from "@src/entity";
import BN from "@src/utils/BN";

import { FetchOrdersParams, FetchTradesParams, MarketCreateEvent, SpotMarketVolume } from "../types";

import { CONTRACT_ADDRESSES } from "./constants";
import { OrderbookAbi__factory } from "./types";

export class Fetch {
  fetchMarkets = async (
    limit: number,
    tokens: Token[],
    wallet: WalletLocked | WalletUnlocked,
  ): Promise<MarketCreateEvent[]> => {
    const orderbookFactory = OrderbookAbi__factory.connect(CONTRACT_ADDRESSES.spotMarket, wallet);

    const getMarketByIdPromises = tokens.map((t) =>
      orderbookFactory.functions
        .get_market_by_id({
          value: t.assetId,
        })
        .simulate(),
    );

    const data = await Promise.all(getMarketByIdPromises);

    const markets = data.map((market) => ({
      id: market.value.asset_id.value,
      assetId: market.value.asset_id.value,
      decimal: market.value.asset_decimals,
    }));

    return markets;
  };

  fetchMarketPrice = async (baseToken: string): Promise<BN> => {
    console.warn("[fetchMarketPrice] NOT IMPLEMENTED FOR FUEL");
    return BN.ZERO;
  };

  fetchOrders = async (
    { baseToken, type, limit, trader, isActive }: FetchOrdersParams,
    wallet: WalletLocked | WalletUnlocked,
  ): Promise<SpotMarketOrder[]> => {
    const orderbookFactory = OrderbookAbi__factory.connect(CONTRACT_ADDRESSES.spotMarket, wallet);

    // TODO: Should be fixed. Can't get all trades, only for trader.
    if (!trader) return [];

    const ordersId = await orderbookFactory.functions
      .orders_by_trader({
        value: new Address(trader as Bech32Address).toB256(),
      })
      .simulate();

    const ordersPromises = ordersId.value.map((order) => orderbookFactory.functions.order_by_id(order).simulate());

    const data = await Promise.all(ordersPromises);

    const dataFiltered = data.filter(({ value }) => {
      if (value?.base_token.value !== baseToken) return false;
      if (value?.base_size.negative && type && type !== "SELL") return false;

      return true;
    });

    const orders = dataFiltered.map(({ value }) => {
      const baseSizeBn = new BN(value!.base_size.value.toString());
      const baseSize = value!.base_size.negative ? baseSizeBn.times(-1) : baseSizeBn;
      return new SpotMarketOrder({
        id: value!.id,
        baseToken: value!.base_token.value,
        trader: value!.trader.value,
        baseSize: baseSize.toNumber(),
        orderPrice: value!.base_price.toNumber(),
        // TODO: Fetch date somehow
        blockTimestamp: Date.now(),
      });
    });

    return orders;
  };

  fetchTrades = async ({ baseToken, limit, trader }: FetchTradesParams): Promise<SpotMarketTrade[]> => {
    console.warn("[fetchTrades] NOT IMPLEMENTED FOR FUEL");
    return [];
  };

  fetchVolume = async (): Promise<SpotMarketVolume> => {
    console.warn("[fetchVolume] NOT IMPLEMENTED FOR FUEL");
    return { volume: BN.ZERO, high: BN.ZERO, low: BN.ZERO };
  };
}
