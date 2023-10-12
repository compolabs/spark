import { initMongo } from "../src/services/mongoService";
import { getTrades, Trade } from "../src/models/Trade";
import { supportedResolutions, TOKENS_BY_SYMBOL } from "../src/constants";
import BN from "../src/utils/BN";
import dayjs from "dayjs";
import { roundDateToCandleUnix } from "../src/utils/roundDateToCandleUnix";
import { ChartCrone } from "../src/crones/syncChartCrone";

describe("test", () => {
  beforeAll(() => initMongo());
  it("candle interval test", async () => {
    const now = dayjs();
    const res = supportedResolutions.map((period) => {
      const unixUp = roundDateToCandleUnix(now, "up", period);
      const unixDown = roundDateToCandleUnix(now, "down", period);
      if (unixUp === 0 || unixDown === 0) return;
      return {
        period,
        "candle start": {
          time: dayjs(unixDown * 1000).format("ddd DD-MMM HH:mm:ss.SSS"),
          unix: unixDown,
        },
        "now         ": {
          time: now.format("ddd DD-MMM HH:mm:ss.SSS"),
          unix: now.unix(),
        },
        "candle end  ": {
          time: dayjs(unixUp * 1000).format("ddd DD-MMM HH:mm:ss.SSS"),
          unix: unixUp,
        },
      };
    });
    console.log(res);
  });
});

describe("Trades normalize", () => {
  beforeAll(() => initMongo());
  it("Normalize chart UNI/USDC", async () => {
    const trades = await Trade.find({});
    let res = trades
      .filter(
        ({ asset0, asset1 }) =>
          [asset0, asset1].includes(TOKENS_BY_SYMBOL.BTC.assetId) &&
          [asset0, asset1].includes(TOKENS_BY_SYMBOL.USDC.assetId)
      )
      .map((trade) => ({
        id: trade.id,
        price:
          trade.asset0 === TOKENS_BY_SYMBOL.BTC.assetId &&
          trade.asset1 === TOKENS_BY_SYMBOL.USDC.assetId
            ? BN.formatUnits(trade.amount1, 6).div(BN.formatUnits(trade.amount0)).toNumber()
            : BN.formatUnits(trade.amount0, 6).div(BN.formatUnits(trade.amount1)).toNumber(),
      }))
      .filter((trade) => trade.price > 30000 || trade.price < 25000);
    console.log(res);
    await Trade.deleteMany({ _id: { $in: res.map(({ id }) => id) } });
  }, 500000);
});

//----------------------------------------------------------------------------------------

const market = "UNI/USDC";
describe("Migrate", () => {
  beforeAll(() => initMongo());
  it("Migrate trades to candles", async () => {
    for (let i in supportedResolutions) {
      await ChartCrone.syncChartCrone(market, supportedResolutions[i]);
      console.log(`✅ Resolution ${supportedResolutions[i]} migrated`);
    }
  }, 90000000);
});

describe("getTrades", () => {
  it("getTrades", async () => {
    const res = await getTrades(market, 1696758893, 1696769773);
    console.log(res.length);
  }, 90000000);
});
