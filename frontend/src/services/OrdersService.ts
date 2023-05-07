import axios from "axios";
import { BACKEND_URL, TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import dayjs from "dayjs";

interface IOrderResponse {
  id: number;
  owner: string;
  asset0: string;
  amount0: string;
  asset1: string;
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

export class Order {
  asset0: string;
  amount0: BN;
  asset1: string;
  amount1: BN;
  status: string;
  fulfilled0: BN;
  fulfilled1: BN;
  owner: string;
  id: string;
  timestamp: string;
  matcher_fee: BN;
  matcher_fee_used: BN;
  type: "SELL" | "BUY";
  price: number;
  market: string;

  constructor(orderOutput: IOrderResponse) {
    this.id = orderOutput.id.toString();
    this.asset0 = orderOutput.asset0;
    this.amount0 = new BN(orderOutput.amount0.toString());
    this.asset1 = orderOutput.asset1;
    this.amount1 = new BN(orderOutput.amount1.toString());
    this.status = orderOutput.status;
    this.fulfilled0 = new BN(orderOutput.fulfilled0.toString());
    this.fulfilled1 = new BN(orderOutput.fulfilled1.toString());
    this.owner = orderOutput.owner;
    this.timestamp = orderOutput.timestamp.toString();
    this.matcher_fee = new BN(orderOutput.matcher_fee.toString());
    this.matcher_fee_used = new BN(orderOutput.matcher_fee_used.toString());
    this.type = orderOutput.type;
    this.price = orderOutput.price;
    this.market = orderOutput.market;
  }

  get token0() {
    return TOKENS_BY_ASSET_ID[this.asset0];
  }

  get token1() {
    return TOKENS_BY_ASSET_ID[this.asset1];
  }

  get time() {
    return dayjs(+this.timestamp * 1000).format("DD-MMM HH:mm:ss");
  }

  get fullFillPercent() {
    return this.fulfilled0.eq(0)
      ? 0
      : +this.fulfilled0.times(100).div(this.amount0).toFormat(2);
  }

  get priceFormatter() {
    const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
    const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
    const price = am1.div(am0);
    return `${price.toFormat(price.lt(0.01) ? 4 : 2)} ${this.token1.symbol}`;
  }

  // get price() {
  //   const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
  //   const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
  //   return am1.div(am0);
  // }

  // get reversePrice() {
  //   const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
  //   const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
  //   return am0.div(am1);
  // }

  get amount() {
    const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
    return am0.toFormat(am0.lt(0.01) ? 9 : 2);
  }

  get amountLeft() {
    const amount = BN.formatUnits(
      this.amount0.minus(this.fulfilled0),
      this.token0.decimals
    );
    return amount.toFormat(amount.lt(0.01) ? 6 : 2);
  }

  get total() {
    const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
    return am1.toFormat(am1.lt(0.01) ? 6 : 2);
  }

  get totalLeft() {
    const left = BN.formatUnits(
      this.amount1.minus(this.fulfilled1),
      this.token1.decimals
    );
    return left.toFormat(left.lt(0.01) ? 6 : 2);
  }
}

export const getActiveOrders = (): Promise<Order[]> =>
  axios
    .get(`${BACKEND_URL}/orders/?status=Active`)
    .then((res) => res.data)
    .then((arr: Array<IOrderResponse>) => arr.map((o) => new Order(o)));

type TOrderbookResponse = {
  myOrders: Array<IOrderResponse>;
  orderbook: { buy: Array<IOrderResponse>; sell: Array<IOrderResponse> };
};

export const getOrderbook = (
  owner: string,
  symbol: string
): Promise<{
  myOrders: Array<Order>;
  orderbook: { buy: Array<Order>; sell: Array<Order> };
}> =>
  axios
    .get(`${BACKEND_URL}/orderbook?address=${owner}&symbol=${symbol}`)
    .then((res) => res.data)
    .then((res: TOrderbookResponse) => ({
      myOrders: res.myOrders.map((o) => new Order(o)),
      orderbook: {
        sell: res.orderbook.sell.map((o) => new Order(o)),
        buy: res.orderbook.buy.map((o) => new Order(o)),
      },
    }));

export const createOrder = (order: any): Promise<{}> =>
  axios.post(`${BACKEND_URL}/`, order);
