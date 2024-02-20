import dayjs, { Dayjs } from "dayjs";
import { Nullable } from "tsdef";

import { DEFAULT_DECIMALS, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";

import { Token } from "./Token";

interface SpotMarketTradeParams {
  id: string;
  baseToken: Token;
  matcher: string;
  seller: string;
  buyer: string;
  tradeAmount: BN;
  price: BN;
  timestamp: number;
  userAddress: string;
}

const getType = (userAddress: string, buyer: string, seller: string) => {
  const address = userAddress.toLowerCase();
  return address === seller.toLowerCase() ? "SELL" : address === buyer.toLowerCase() ? "BUY" : null;
};

export class SpotMarketTrade {
  readonly id: SpotMarketTradeParams["id"];
  readonly baseToken: SpotMarketTradeParams["baseToken"];
  readonly matcher: SpotMarketTradeParams["matcher"];
  readonly seller: SpotMarketTradeParams["seller"];
  readonly buyer: SpotMarketTradeParams["buyer"];
  readonly tradeAmount: SpotMarketTradeParams["tradeAmount"];
  readonly price: SpotMarketTradeParams["price"];
  readonly timestamp: Dayjs;
  readonly quoteToken = TOKENS_BY_SYMBOL.USDC;
  readonly type: Nullable<"SELL" | "BUY"> = null;

  constructor(params: SpotMarketTradeParams) {
    this.id = params.id;
    this.baseToken = params.baseToken;
    this.matcher = params.matcher;
    this.seller = params.seller;
    this.buyer = params.buyer;
    this.tradeAmount = params.tradeAmount;
    this.price = params.price;
    this.timestamp = dayjs.unix(params.timestamp);
    this.type = getType(params.userAddress, this.buyer, this.seller);
  }

  get formatPrice() {
    return BN.formatUnits(this.price, DEFAULT_DECIMALS).toSignificant(2);
  }

  get formatTradeAmount() {
    return BN.formatUnits(this.tradeAmount, this.baseToken.decimals).toSignificant(2);
  }

  get marketSymbol() {
    return `${this.baseToken.symbol}-${this.quoteToken.symbol}`;
  }
}
