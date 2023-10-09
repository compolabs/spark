import { IToken, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "../constants";
import BN from "../utils/BN";

export interface IOrderResponse {
  id: string;
  order_id: number;
  owner: string;
  asset0: string;
  amount0: number;
  asset1: string;
  amount1: number;
  status: string;
  fulfilled0: number;
  fulfilled1: number;
  timestamp: number;
  matcher_fee: number;
  matcher_fee_used: number;
}

export interface IOrder {
  id: string;
  orderId: number;
  owner: string;
  asset0: IToken;
  amount0: string;
  asset1: IToken;
  amount1: string;
  status: string;
  fulfilled0: string;
  fulfilled1: string;
  timestamp: number;
  matcher_fee: string;
  matcher_fee_used: string;
  type: "SELL" | "BUY";
  price: number;
  market: string;
}

export const orderOutputToIOrder = (order: IOrderResponse): IOrder => {
  const UNI = TOKENS_BY_SYMBOL.UNI;
  const USDC = TOKENS_BY_SYMBOL.USDC;
  let type = "";
  if (`0x${order.asset0}` === UNI.assetId && `0x${order.asset1}` === USDC.assetId) type = "SELL";
  if (`0x${order.asset0}` === USDC.assetId && `0x${order.asset1}` === UNI.assetId) type = "BUY";
  return {
    id: order.id,
    orderId: order.order_id,
    owner: `0x${order.owner}`,
    asset0: TOKENS_BY_ASSET_ID[`0x${order.asset0}`],
    amount0: order.amount0.toString(),
    asset1: TOKENS_BY_ASSET_ID[`0x${order.asset1}`],
    amount1: order.amount1.toString(),
    status: order.status,
    fulfilled0: order.fulfilled0.toString(),
    fulfilled1: order.fulfilled1.toString(),
    timestamp: order.timestamp,
    matcher_fee: order.matcher_fee.toString(),
    matcher_fee_used: order.matcher_fee_used.toString(),
    market: "BTC/USDC",
    type: type as any,
    price:
      type === "SELL"
        ? BN.formatUnits(order.amount1.toString(), USDC.decimals)
            .div(BN.formatUnits(order.amount0.toString(), UNI.decimals))
            .toNumber()
        : BN.formatUnits(order.amount0.toString(), USDC.decimals)
            .div(BN.formatUnits(order.amount1.toString(), UNI.decimals))
            .toNumber(),
  };
};

// export type OrderDocument = Document & IOrder;

// const OrderSchema = new mongoose.Schema({
//   id: { type: Number, required: true, unique: true },
//   owner: { type: String, required: true },
//   asset0: { type: String, required: true },
//   amount0: { type: String, required: true },
//   asset1: { type: String, required: true },
//   amount1: { type: String, required: true },
//   status: { type: String, required: true },
//   fulfilled0: { type: String, required: true },
//   fulfilled1: { type: String, required: true },
//   timestamp: { type: Number, required: true },
//   matcher_fee: { type: String, required: true },
//   matcher_fee_used: { type: String, required: true },
//   market: { type: String, required: true },
//   price: { type: Number, required: true },
//   type: { type: String, enum: ["SELL", "BUY"], required: true },
// });
// export const Order = mongoose.model<OrderDocument>("Order", OrderSchema);
