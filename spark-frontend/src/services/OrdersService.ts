import axios from "axios";
import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
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

// export const getActiveOrders = (): Promise<Order[]> => new Promise(() => [] as Order[]);

// export const getOrderbook = async (
//   owner: string,
//   market: string
// ): Promise<{
//   myOrders: Array<Order>;
//   orderbook: { buy: Array<Order>; sell: Array<Order> };
// }> => {
//   return new Promise(r => r({
//     "myOrders": [
//       {
//         "asset0": "0x8bf7951ea3222fe0bae9b811c2b142a1ff417361dcf7457855ed477d2d9a8550",
//         "amount0": new BN("1000000000"),
//         "asset1": "0xae37bc0feb66e60a89e301d450bb4640aa9bd7cedd856e253e23989eae536e92",
//         "amount1": new BN("300000000000"),
//         "status": "Canceled",
//         "fulfilled0": new BN("0"),
//         "fulfilled1": new BN("0"),
//         "owner": "194c4d5d321ea3bc2e87109f4a86520ad60f924998f67007d487d3cc0acc45d2",
//         "id": "cd2662154e6d76b2b2b92e70c0cac3ccf534f9b74eb5b89819ec509083d00a50",
//         "timestamp": "4611686020123641000",
//         "matcher_fee": new BN("1000"),
//         "matcher_fee_used":new BN( "0"),
//         "type": "BUY",
//         "price": 3.3333333333333335,
//         "market": "UNI/USDC"
//       },
//       {
//         "asset0": "0x8bf7951ea3222fe0bae9b811c2b142a1ff417361dcf7457855ed477d2d9a8550",
//         "amount0": new BN("1000000000"),
//         "asset1": "0xae37bc0feb66e60a89e301d450bb4640aa9bd7cedd856e253e23989eae536e92",
//         "amount1": new BN("300000000000"),
//         "status": "Active",
//         "fulfilled0": new BN("0"),
//         "fulfilled1": new BN("0"),
//         "owner": "194c4d5d321ea3bc2e87109f4a86520ad60f924998f67007d487d3cc0acc45d2",
//         "id": "cd04a4754498e06db5a13c5f371f1f04ff6d2470f24aa9bd886540e5dce77f70",
//         "timestamp": "4611686020123641000",
//         "matcher_fee": new BN("1000"),
//         "matcher_fee_used":new BN( "0"),
//         "type": "BUY",
//         "price": 3.3333333333333335,
//         "market": "UNI/USDC"
//       },
//       {
//         "asset0": "0xae37bc0feb66e60a89e301d450bb4640aa9bd7cedd856e253e23989eae536e92",
//         "amount0": new BN("300000000000"),
//         "asset1": "0x8bf7951ea3222fe0bae9b811c2b142a1ff417361dcf7457855ed477d2d9a8550",
//         "amount1": new BN("1000000000"),
//         "status": "Active",
//         "fulfilled0": new BN("0"),
//         "fulfilled1": new BN("0"),
//         "owner": "194c4d5d321ea3bc2e87109f4a86520ad60f924998f67007d487d3cc0acc45d2",
//         "id": "8005f02d43fa06e7d0585fb64c961d57e318b27a145c857bcd3a6bdb413ff7fc",
//         "timestamp": "4611686020123641000",
//         "matcher_fee": new BN("1000"),
//         "matcher_fee_used":new BN( "0"),
//         "type": "SELL",
//         "price": 3.3333333333333335,
//         "market": "UNI/USDC"
//       },
//       {
//         "asset0": "0x8bf7951ea3222fe0bae9b811c2b142a1ff417361dcf7457855ed477d2d9a8550",
//         "amount0": new BN("1000000000"),
//         "asset1": "0xae37bc0feb66e60a89e301d450bb4640aa9bd7cedd856e253e23989eae536e92",
//         "amount1": new BN("300000000000"),
//         "status": "Completed",
//         "fulfilled0": new BN("1000000000"),
//         "fulfilled1": new BN("300000000000"),
//         "owner": "194c4d5d321ea3bc2e87109f4a86520ad60f924998f67007d487d3cc0acc45d2",
//         "id": "d5688a52d55a02ec4aea5ec1eadfffe1c9e0ee6a4ddbe2377f98326d42dfc975",
//         "timestamp": "4611686020123641000",
//         "matcher_fee": new BN("1000"),
//         "matcher_fee_used":new BN( "1000"),
//         "type": "BUY",
//         "price": 3.3333333333333335,
//         "market": "UNI/USDC"
//       },
//       {
//         "asset0": "0x8bf7951ea3222fe0bae9b811c2b142a1ff417361dcf7457855ed477d2d9a8550",
//         "amount0": new BN("1000000000"),
//         "asset1": "0xae37bc0feb66e60a89e301d450bb4640aa9bd7cedd856e253e23989eae536e92",
//         "amount1": new BN("300000000000"),
//         "status": "Active",
//         "fulfilled0": new BN("0"),
//         "fulfilled1": new BN("0"),
//         "owner": "194c4d5d321ea3bc2e87109f4a86520ad60f924998f67007d487d3cc0acc45d2",
//         "id": "5dee4dd60ff8d0ba9900fe91e90e0dcf65f0570d42c431f727d0300dd70dc431",
//         "timestamp": "4611686020123680000",
//         "matcher_fee": new BN("1000"),
//         "matcher_fee_used":new BN( "0"),
//         "type": "BUY",
//         "price": 3.3333333333333335,
//         "market": "UNI/USDC"
//       },
//       {
//         "asset0": "0x8bf7951ea3222fe0bae9b811c2b142a1ff417361dcf7457855ed477d2d9a8550",
//         "amount0": new BN("1000000000"),
//         "asset1": "0xae37bc0feb66e60a89e301d450bb4640aa9bd7cedd856e253e23989eae536e92",
//         "amount1": new BN("300000000000"),
//         "status": "Active",
//         "fulfilled0": new BN("0"),
//         "fulfilled1": new BN("0"),
//         "owner": "194c4d5d321ea3bc2e87109f4a86520ad60f924998f67007d487d3cc0acc45d2",
//         "id": "14ac577cdb2ef6d986078b4054cc9893a9a14a16dbb0d8f37b89167c1f1aacdf",
//         "timestamp": "4611686020123680000",
//         "matcher_fee": new BN("1000"),
//         "matcher_fee_used":new BN( "0"),
//         "type": "BUY",
//         "price": 3.3333333333333335,
//         "market": "UNI/USDC"
//       }
//     ],
//     "orderbook": {
//       "sell": [
//         {
//           "asset0": "0xae37bc0feb66e60a89e301d450bb4640aa9bd7cedd856e253e23989eae536e92",
//           "amount0": new BN("300000000000"),
//           "asset1": "0x8bf7951ea3222fe0bae9b811c2b142a1ff417361dcf7457855ed477d2d9a8550",
//           "amount1": new BN("1000000000"),
//           "status": "Active",
//           "fulfilled0": new BN("0"),
//           "fulfilled1": new BN("0"),
//           "owner": "194c4d5d321ea3bc2e87109f4a86520ad60f924998f67007d487d3cc0acc45d2",
//           "id": "8005f02d43fa06e7d0585fb64c961d57e318b27a145c857bcd3a6bdb413ff7fc",
//           "timestamp": "4611686020123641000",
//           "matcher_fee": new BN("1000"),
//           "matcher_fee_used":new BN( "0"),
//           "type": "SELL",
//           "price": 3.3333333333333335,
//           "market": "UNI/USDC"
//         }
//       ],
//       "buy": [
//         {
//           "asset0": "0x8bf7951ea3222fe0bae9b811c2b142a1ff417361dcf7457855ed477d2d9a8550",
//           "amount0": new BN("1000000000"),
//           "asset1": "0xae37bc0feb66e60a89e301d450bb4640aa9bd7cedd856e253e23989eae536e92",
//           "amount1": new BN("300000000000"),
//           "status": "Active",
//           "fulfilled0": new BN("0"),
//           "fulfilled1": new BN("0"),
//           "owner": "194c4d5d321ea3bc2e87109f4a86520ad60f924998f67007d487d3cc0acc45d2",
//           "id": "cd04a4754498e06db5a13c5f371f1f04ff6d2470f24aa9bd886540e5dce77f70",
//           "timestamp": "4611686020123641000",
//           "matcher_fee": new BN("1000"),
//           "matcher_fee_used":new BN( "0"),
//           "type": "BUY",
//           "price": 3.3333333333333335,
//           "market": "UNI/USDC"
//         },
//         {
//           "asset0": "0x8bf7951ea3222fe0bae9b811c2b142a1ff417361dcf7457855ed477d2d9a8550",
//           "amount0": new BN("1000000000"),
//           "asset1": "0xae37bc0feb66e60a89e301d450bb4640aa9bd7cedd856e253e23989eae536e92",
//           "amount1": new BN("300000000000"),
//           "status": "Active",
//           "fulfilled0": new BN("0"),
//           "fulfilled1": new BN("0"),
//           "owner": "194c4d5d321ea3bc2e87109f4a86520ad60f924998f67007d487d3cc0acc45d2",
//           "id": "5dee4dd60ff8d0ba9900fe91e90e0dcf65f0570d42c431f727d0300dd70dc431",
//           "timestamp": "4611686020123680000",
//           "matcher_fee": new BN("1000"),
//           "matcher_fee_used":new BN( "0"),
//           "type": "BUY",
//           "price": 3.3333333333333335,
//           "market": "UNI/USDC"
//         },
//         {
//           "asset0": "0x8bf7951ea3222fe0bae9b811c2b142a1ff417361dcf7457855ed477d2d9a8550",
//           "amount0": new BN("1000000000"),
//           "asset1": "0xae37bc0feb66e60a89e301d450bb4640aa9bd7cedd856e253e23989eae536e92",
//           "amount1": new BN("300000000000"),
//           "status": "Active",
//           "fulfilled0": new BN("0"),
//           "fulfilled1": new BN("0"),
//           "owner": "194c4d5d321ea3bc2e87109f4a86520ad60f924998f67007d487d3cc0acc45d2",
//           "id": "14ac577cdb2ef6d986078b4054cc9893a9a14a16dbb0d8f37b89167c1f1aacdf",
//           "timestamp": "4611686020123680000",
//           "matcher_fee": new BN("1000"),
//           "matcher_fee_used":new BN( "0"),
//           "type": "BUY",
//           "price": 3.3333333333333335,
//           "market": "UNI/USDC"
//         }
//       ]
//     }
//   } as any))
// }
export const getOrderbook = async (
  owner: string,
  market: string
): Promise<{
  myOrders: Array<Order>;
  orderbook: { buy: Array<Order>; sell: Array<Order> };
}> => {
  const [symbol0, symbol1] = market.split("/");
  let assetId0 = TOKENS_BY_SYMBOL[symbol0].assetId.substring(2);
  let assetId1 = TOKENS_BY_SYMBOL[symbol1].assetId.substring(2);
  const sellQuery = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_spark_indexer.orderentity WHERE status = 'Active' AND asset0 = '${assetId0}' AND asset1 = '${assetId1}') t;`;
  const buyQuery = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_spark_indexer.orderentity WHERE status = 'Active' AND asset0 = '${assetId1}' AND asset1 = '${assetId0}') t;`;
  owner = owner.substring(2);
  const ownerQuery = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_spark_indexer.orderentity WHERE owner = '${owner}') t;`;
  // const url = "https://spark-indexer.spark-defi.com/api/sql/composabilitylabs/spark_indexer";
  const url = "http://localhost:29987/api/sql/composabilitylabs/spark_indexer";
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  const res = await Promise.all([
    axios.request({ method: "POST", url, headers, data: { query: buyQuery } }),
    axios.request({ method: "POST", url, headers, data: { query: sellQuery } }),
    owner.length === 0
      ? null
      : axios.request({
          method: "POST",
          url,
          headers,
          data: { query: ownerQuery }
        })
  ]);
  res.map((res) => console.log(res?.data.data[0]));
  const [buy, sell, myOrders] = res.map((res) =>
    res?.data.data[0] != null
      ? res.data.data[0].map((order: any) => {
          console.log(order);
          return new Order({
            ...order,
            market,
            asset0: `0x${order.asset0}`,
            asset1: `0x${order.asset1}`,
            type: assetId0 === order.asset0 ? "SELL" : "BUY",
            price:
              assetId0 === order.asset0
                ? BN.formatUnits(order.amount1, TOKENS_BY_SYMBOL.USDC.decimals)
                    .div(
                      BN.formatUnits(
                        order.amount0,
                        TOKENS_BY_SYMBOL.UNI.decimals
                      )
                    )
                    .toNumber()
                : BN.formatUnits(order.amount0, TOKENS_BY_SYMBOL.USDC.decimals)
                    .div(
                      BN.formatUnits(
                        order.amount1,
                        TOKENS_BY_SYMBOL.UNI.decimals
                      )
                    )
                    .toNumber()
          });
        })
      : []
  );
  console.log({ myOrders, orderbook: { sell, buy } });
  return { myOrders, orderbook: { sell, buy } };
};
