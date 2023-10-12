import { getTrades, ITrade } from "../models/Trade";
import { supportedResolutions, TOKENS_LIST } from "../constants";
import BN from "../utils/BN";
import { roundUnixToCandleUnix } from "../utils/roundDateToCandleUnix";
import { Candle } from "../models/Candle";

class UDFError extends Error {}

class SymbolNotFound extends UDFError {}

type TSymbol = {
  symbol: string;
  ticker: string;
  name: string;
  full_name: string;
  description: string;
  currency_code: string;
};

export const symbols = TOKENS_LIST.map(({ symbol }) => symbol).reduce((acc, symbol0, _, arr) => {
  const batch = arr
    .filter((symbol1) => symbol1 !== symbol0)
    .map((symbol1) => ({
      symbol: `${symbol0}/${symbol1}`,
      ticker: `${symbol0}/${symbol1}`,
      name: `${symbol0}/${symbol1}`,
      full_name: `${symbol0}/${symbol1}`,
      description: `${symbol0} / ${symbol1}`,
      currency_code: symbol1,
      exchange: "SPARK",
      listed_exchange: "SPARK",
      type: "crypto",
      session: "24x7",
      timezone: "UTC",
      minmovement: 1,
      minmov: 1,
      minmovement2: 0,
      minmov2: 0,
      supported_resolutions: supportedResolutions,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      data_status: "streaming",
    }));
  return [...acc, ...batch];
}, [] as Array<TSymbol>);

export default class UDF {
  constructor() {}

  config() {
    return {
      exchanges: [
        {
          value: "SPARK",
          name: "Spark",
          desc: "Spark",
        },
      ],
      symbols_types: [
        {
          value: "crypto",
          name: "Cryptocurrency",
        },
      ],
      supported_resolutions: supportedResolutions,
      supports_search: true,
      supports_group_request: false,
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
    };
  }

  /**
   * Symbol resolve.
   * @param {string} input Symbol name or ticker.
   * @returns {object} Symbol.
   */
  symbol(input: string) {
    const comps = input.split(":");
    const s = (comps.length > 1 ? comps[1] : input).toUpperCase();
    const symbol = symbols.find(({ symbol }) => symbol === s);
    if (symbol != null) return symbol;

    throw new SymbolNotFound();
  }

  /**
   * Bars.
   * @param {string} symbol_str - Symbol name or ticker.
   * @param {number} from - Unix timestamp (UTC) of leftmost required bar.
   * @param {number} to - Unix timestamp (UTC) of rightmost required bar.
   * @param {string} resolution
   */
  async history(symbol_str: string, from: number, to: number, resolution: string) {
    // console.log(
    //   dayjs(from * 1000).format("DD-MMM HH:mm:ss.SSS"),
    //   "-",
    //   dayjs(to * 1000).format("DD-MMM HH:mm:ss.SSS")
    // );
    from = roundUnixToCandleUnix(from, "down", resolution);
    to = roundUnixToCandleUnix(to, "up", resolution);

    const symbol = symbols.find((s) => s.symbol === symbol_str);
    if (symbol == null) throw new SymbolNotFound();
    // const [assetSymbol0, assetSymbol1] = symbol.symbol.split("/");
    //
    // const asset0 = TOKENS_BY_SYMBOL[assetSymbol0];
    // const asset1 = TOKENS_BY_SYMBOL[assetSymbol1];
    const candles = await Candle.find({ resolution, t: { $gt: from, $lt: to } }); //TODO SYMBOL
    // console.log({
    //   candles: candles.length,
    //   from: dayjs(from * 1000).format("DD-MMM HH:mm:ss.SSS"),
    //   to: dayjs(to * 1000).format("DD-MMM HH:mm:ss.SSS"),
    // });
    const tradesFrom =
      candles.length > 0 ? candles[candles.length - 1].t + getPeriodInSeconds(resolution) : from;
    const trades = await getTrades(symbol_str, tradesFrom, to);
    // console.log({
    //   trades: trades.length,
    //   tradesFrom: dayjs(tradesFrom * 1000).format("DD-MMM HH:mm:ss.SSS"),
    //   to: dayjs(from * 1000).format("DD-MMM HH:mm:ss.SSS"),
    // });
    const lastCandles = generateKlines(trades, resolution, tradesFrom, to);
    const s = candles.length === 0 && trades.length === 0 ? "no_data" : "ok";
    const result: TKlines = { s, t: [], c: [], o: [], h: [], l: [], v: [] };
    candles.forEach((candle) => {
      result.t.push(candle.t);
      result.c.push(candle.c);
      result.o.push(candle.o);
      result.h.push(candle.h);
      result.l.push(candle.l);
      result.v.push(candle.v);
    });
    result.t = [...result.t, ...lastCandles.t];
    result.c = [...result.c, ...lastCandles.c];
    result.o = [...result.o, ...lastCandles.o];
    result.h = [...result.h, ...lastCandles.h];
    result.l = [...result.l, ...lastCandles.l];
    result.v = [...result.v, ...lastCandles.v];
    return result;
  }
}

type TKlines = {
  s: "ok" | "no_data";
  o: Array<number>;
  h: Array<number>;
  l: Array<number>;
  c: Array<number>;
  v: Array<number>;
  t: Array<number>;
};

function generateKlines(trades: ITrade[], period: string, from: number, to: number) {
  const sorted = trades.slice().sort((a, b) => (+a.timestamp < +b.timestamp ? -1 : 1));
  const result: TKlines = { s: "no_data", t: [], c: [], o: [], h: [], l: [], v: [] };
  if (sorted.length == 0) return result;
  let start = from;
  while (true) {
    const end = +start + getPeriodInSeconds(period);
    const batch = sorted.filter(({ timestamp }) => +timestamp >= start && +timestamp <= end);
    if (batch.length > 0) {
      if (result.s === "no_data") result.s = "ok";
      const prices = batch.map((t: any) => t.price.toNumber());
      const sum = batch.reduce((amount, { amount0 }) => amount.plus(amount0), BN.ZERO);
      result.t.push(+start); // result.t.push(+batch[0].timestamp);
      result.o.push(prices[0]);
      result.c.push(prices[prices.length - 1]);
      result.h.push(Math.max(...prices));
      result.l.push(Math.min(...prices));
      result.v.push(sum.toNumber());
    }
    start = end;
    if (start > +sorted[sorted.length - 1].timestamp) break;
  }
  return result;
}

export function getPeriodInSeconds(period: string): number {
  const map: Record<string, number> = {
    "1": 60,
    "3": 3 * 60,
    "5": 5 * 60,
    "15": 15 * 60,
    "30": 30 * 60,
    "60": 60 * 60,
    "120": 2 * 60 * 60,
    "240": 4 * 60 * 60,
    "360": 6 * 60 * 60,
    "480": 8 * 60 * 60,
    "720": 12 * 60 * 60,
    D: 24 * 60 * 60,
    "1D": 24 * 60 * 60,
    "3D": 3 * 24 * 60 * 60,
    W: 7 * 24 * 60 * 60,
    "1W": 7 * 24 * 60 * 60,
    M: 30 * 24 * 60 * 60, //TODO fix
    "1M": 30 * 24 * 60 * 60, //TODO fix
  };
  if (map[period] != null) {
    return map[period];
  } else {
    throw new Error(`Invalid period: ${period}`);
  }
}
