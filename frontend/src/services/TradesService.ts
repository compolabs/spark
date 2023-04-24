import axios from "axios";
import { BACKEND_URL, TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import dayjs from "dayjs";

interface ITradeResponse {
  id: number;
  owner: string;
  asset0: string;
  asset1: string;
  amount0: string;
  amount1: string;
  timestamp: number;
}

export class Trade {
  asset0: string;
  amount0: BN;
  asset1: string;
  amount1: BN;
  timestamp: number;

  constructor(tradeOutput: ITradeResponse) {
    this.asset0 = tradeOutput.asset0;
    this.amount0 = new BN(tradeOutput.amount0.toString());
    this.asset1 = tradeOutput.asset1;
    this.amount1 = new BN(tradeOutput.amount1.toString());
    this.timestamp = tradeOutput.timestamp;
  }

  get token0() {
    return TOKENS_BY_ASSET_ID[this.asset0];
  }

  get token1() {
    return TOKENS_BY_ASSET_ID[this.asset1];
  }

  get time() {
    return dayjs(this.timestamp).format("HH:mm:ss");
  }

  get priceFormatter() {
    const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
    const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
    const price = am1.div(am0);
    return price.toFormat(price.lt(0.01) ? 4 : 2);
  }

  get price() {
    const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
    const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
    return am1.div(am0);
  }

  get reversePrice() {
    const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
    const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
    return am0.div(am1);
  }

  get amount() {
    const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
    return am0.toFormat(am0.lt(0.01) ? 9 : 2);
  }

  get total() {
    const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
    return am1.toFormat(am1.lt(0.01) ? 6 : 2);
  }
}

export const getActiveOrders = () =>
  axios
    .get(`${BACKEND_URL}/trades`)
    .then((res) => res.data)
    .then((arr: Array<ITradeResponse>) => arr.map((t) => new Trade(t)));

export const getLatestTradesInPair = (symbol0: string, symbol1: string) =>
  axios
    .get(`${BACKEND_URL}/trades/pair/${symbol0}/${symbol1}`)
    .then((res) => res.data)
    .then((arr: Array<ITradeResponse>) => arr.map((t) => new Trade(t)));
