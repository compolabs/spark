import { schedule } from "node-cron";
import { getFirstTrade, getLastTrade, getTrades, ITrade, Trade } from "../models/Trade";
import { Candle } from "../models/Candle";
import { roundUnixToCandleUnix } from "../utils/roundDateToCandleUnix";
import { getPeriodInSeconds } from "../services/udf";
import dayjs from "dayjs";
import BN from "../utils/BN";

const market = "UNI/USDC";

const map: Record<string, string> = {
  "1": "*/1 * * * *",
  "3": "*/3 * * * *",
  "5": "*/5 * * * *",
  "15": "*/15 * * * *",
  "30": "*/30 * * * *",
  "60": "0 * * * *",
  "120": "0 */2 * * *",
  "240": "0 */4 * * *",
  "360": "0 */6 * * *",
  "480": "0 */8 * * *",
  "720": "0 */12 * * *",
  "1D": "0 9 * * *",
  "3D": "0 0 */3 * *",
  "1W": "0 0 * * 0",
  "1M": "0 0 1 * *",
};

export class ChartCrone {
  readonly resolutions: string[];

  constructor(resolutions: string[]) {
    this.resolutions = resolutions;
  }

  status: Record<string, boolean> = {};

  start = () =>
    this.resolutions.forEach((resolution) => {
      schedule(map[resolution], () => this.doSyncChartCrone(resolution)).start();
      console.log(`✅ Crone ${resolution} started`);
    });

  private doSyncChartCrone = (resolution: string) => {
    if (this.status[resolution]) {
      console.log(`🍃 Crone ${resolution} already started, skipping`);
      return;
    }
    this.status[resolution] = true;
    console.log(`🚀 Crone ${resolution} start`);
    ChartCrone.syncChartCrone(market, resolution)
      .then(() => console.log(`🏁 Crone ${resolution} completed`))
      .catch(console.error)
      .finally(() => (this.status[resolution] = false));
  };

  static syncChartCrone = async (market: string, resolution: string) => {
    const [firstTrade, lastTrade] = await Promise.all([
      getFirstTrade(market),
      getLastTrade(market),
    ]);
    if (firstTrade == null || lastTrade == null) throw new Error("Cannot find trades");
    const lastCandle = await Candle.find({ resolution }).sort({ t: -1 }).limit(1); //TODO SYMBOL
    if (lastCandle[0] != null) {
      firstTrade.timestamp = roundUnixToCandleUnix(lastCandle[0].t, "up", resolution) + 1;
    }
    let i = 0;
    while (true) {
      const offset = getPeriodInSeconds(resolution) * i;
      const from = roundUnixToCandleUnix(firstTrade.timestamp, "down", resolution) + offset;
      const to = roundUnixToCandleUnix(firstTrade.timestamp, "up", resolution) + offset;
      if (from > lastTrade.timestamp || to > dayjs().unix()) break;
      const trades = await getTrades(market, from, to);
      const candle = { t: 0, o: 0, c: 0, h: 0, l: 0, v: 0, resolution };
      const prices = trades.map((t: any) => t.price.toNumber());

      const sum = trades.reduce((amount, { amount0 }) => amount.plus(amount0), BN.ZERO);
      candle.t = +(trades[0]?.timestamp ?? from);
      prices.length > 0 && (candle.o = prices[0]);
      prices.length > 0 && (candle.c = prices[prices.length - 1]);
      prices.length > 0 && (candle.h = getMax(prices));
      prices.length > 0 && (candle.l = getMin(prices));
      candle.v = sum.toNumber();
      await Candle.create(candle);
      console.log(
        dayjs(from * 1000).format("DD-MMM HH:mm:ss.SSS"),
        "-",
        dayjs(to * 1000).format("DD-MMM HH:mm:ss.SSS"),
        candle
      );

      i++;
    }
  };
}

function getMax(arr: number[]) {
  let len = arr.length;
  let max = -Infinity;

  while (len--) {
    max = arr[len] > max ? arr[len] : max;
  }
  return max;
}

function getMin(arr: number[]) {
  let len = arr.length;
  let min = 0;

  while (len--) {
    min = arr[len] < min ? arr[len] : min;
  }
  return min;
}

// export const initSyncChartCrone = () => {
//   const scheduledJobFunction = schedule("*/30 * * * *", () =>
//     ChartCrone.syncChartCrone(market, "30")
//   );
//   scheduledJobFunction.start();
// };
