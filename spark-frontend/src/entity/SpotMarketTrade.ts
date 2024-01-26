import { DEFAULT_DECIMALS } from "@src/constants";
import BN from "@src/utils/BN";

import { Token } from "./Token";

interface SpotMarketTradeParams {
  id: string;
  baseToken: Token;
  matcher: string;
  tradeAmount: BN;
  price: BN;
  timestamp: number;
}

export class SpotMarketTrade {
  readonly id: SpotMarketTradeParams["id"];
  readonly baseToken: SpotMarketTradeParams["baseToken"];
  readonly matcher: SpotMarketTradeParams["matcher"];
  readonly tradeAmount: SpotMarketTradeParams["tradeAmount"];
  readonly price: SpotMarketTradeParams["price"];
  readonly timestamp: SpotMarketTradeParams["timestamp"];

  constructor(params: SpotMarketTradeParams) {
    this.id = params.id;
    this.baseToken = params.baseToken;
    this.matcher = params.matcher;
    this.tradeAmount = params.tradeAmount;
    this.price = params.price;
    this.timestamp = params.timestamp;
  }

  get formatPrice() {
    return BN.formatUnits(this.price, DEFAULT_DECIMALS).toFormat(2);
  }

  get formatTradeAmount() {
    return BN.formatUnits(this.price, this.baseToken.decimals).toFormat(2);
  }
}
