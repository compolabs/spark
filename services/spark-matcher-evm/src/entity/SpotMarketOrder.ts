import dayjs, { Dayjs } from "dayjs";

import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "../constants";
import BN from "../utils/BN";

import { Token } from "./Token";

export interface SpotMarketOrderParams {
  id: string;
  baseToken: string;
  trader: string;
  baseSize: number;
  orderPrice: number;
  blockTimestamp: number;
}

export class SpotMarketOrder {
  // Децимал цены = 9
  // Децимал quoteToken = 6 (USDC)
  readonly id: string;
  readonly timestamp: Dayjs;
  readonly baseToken: Token;
  readonly quoteToken = TOKENS_BY_SYMBOL.USDC;
  readonly trader: string;
  readonly baseSize: BN;
  readonly baseSizeUnits: BN;
  readonly quoteSize: BN;
  readonly quoteSizeUnits: BN;
  readonly price: BN;
  readonly priceUnits: BN;
  readonly priceScale = 1e9;
  readonly priceDecimals = 9;
  readonly type: "BUY" | "SELL";

  constructor(order: SpotMarketOrderParams) {
    this.id = order.id;

    if (!TOKENS_BY_ASSET_ID[order.baseToken]) {
      throw new Error("Unexpected token");
    }

    this.baseToken = TOKENS_BY_ASSET_ID[order.baseToken];

    this.trader = order.trader;
    this.type = order.baseSize < 0 ? "SELL" : "BUY";
    this.baseSize = new BN(order.baseSize).abs();
    this.baseSizeUnits = BN.formatUnits(this.baseSize, this.baseToken.decimals);
    this.quoteSize = new BN(order.baseSize)
      .abs()
      .times(order.orderPrice)
      .times(this.quoteToken.decimals)
      .div(Math.pow(10, this.baseToken.decimals) * this.priceScale);
    this.quoteSizeUnits = BN.formatUnits(this.quoteSize, this.quoteToken.decimals);
    this.price = new BN(order.orderPrice);
    this.priceUnits = BN.formatUnits(order.orderPrice, this.priceDecimals);
    this.timestamp = dayjs.unix(order.blockTimestamp);
  }

  get marketSymbol() {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }

  getSpreadPercent(otherOrder: SpotMarketOrder) {
    return new BN(this.price).minus(otherOrder.price).div(this.price).toFixed(2);
  }

  getSpreadPrice(otherOrder: SpotMarketOrder) {
    return BN.formatUnits(new BN(this.price).minus(otherOrder.price), this.priceDecimals).toFixed(
      2
    );
  }
}
