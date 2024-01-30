import { PORT } from "./config";
import { app } from "./app";
import { schedule } from "node-cron";
import { TOKENS_BY_SYMBOL } from "./constants";
import { SpotMarketOrder } from "./entity/SpotMarketOrder";
import { SpotMarket } from "./services/SpotMarketService";
import { print } from "./utils/print";

class SparkMatcher {
  spotMarket: SpotMarket;

  constructor() {
    this.spotMarket = new SpotMarket();
  }

  run(cronExpression: string) {
    // this.doMatch().catch((error) => console.error("Error in initial doMatch call:", error));

    schedule(cronExpression, async () => {
      await this.doMatch();
    }).start();
  }

  public doMatch = async () => {
    const market = TOKENS_BY_SYMBOL.BTC.assetId;

    const [buyOrders, sellOrders]: [SpotMarketOrder[], SpotMarketOrder[]] = await Promise.all([
      this.spotMarket.getOrders({ market, limit: 100, type: "BUY" }),
      this.spotMarket.getOrders({ market, limit: 100, type: "SELL" }),
    ]);

    for (let sellOrder of sellOrders) {
      for (let buyOrder of buyOrders) {
        if (sellOrder.baseToken === buyOrder.baseToken && sellOrder.price.lte(buyOrder.price)) {
          await this.spotMarket.matchOrders(sellOrder.id, buyOrder.id).catch(console.log);
        }
      }
    }
  };
}

const matcher = new SparkMatcher();
matcher.run("*/20 * * * * *");

app.listen(PORT ?? 5000, () => console.log(print));
