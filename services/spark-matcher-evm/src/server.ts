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

    let [buyOrders, sellOrders]: [SpotMarketOrder[], SpotMarketOrder[]] = await Promise.all([
      this.spotMarket.getOrders({ market, limit: 100, type: "BUY" }),
      this.spotMarket.getOrders({ market, limit: 100, type: "SELL" }),
    ]);

    for (let i = 0; i < sellOrders.length; ++i) {
      let sellOrder = sellOrders[i];
      if (sellOrder.baseSize.eq(0)) continue;
      for (let j = 0; j < buyOrders.length; ++j) {
        let buyOrder = buyOrders[j];
        if (buyOrder.baseSize.eq(0)) continue;
        if (
          sellOrder.baseToken === buyOrder.baseToken &&
          sellOrder.price.lte(buyOrder.price) &&
          sellOrder.type === "SELL" &&
          buyOrder.type === "BUY" &&
          sellOrder.baseSize.gt(0) &&
          buyOrder.baseSize.gt(0)
        ) {
          await this.spotMarket
            .matchOrders(sellOrder.id, buyOrder.id)
            .then(() => {
              const amount =
                sellOrder.baseSize > buyOrder.baseSize ? buyOrder.baseSize : sellOrder.baseSize;

              sellOrder.baseSize = sellOrder.baseSize.minus(amount);
              sellOrders[i].baseSize = sellOrder.baseSize;

              buyOrder.baseSize = buyOrder.baseSize.minus(amount);
              buyOrders[i].baseSize = buyOrder.baseSize;
            })
            .catch((e) => console.log(e.reason));
        }
      }
    }
  };
}

const matcher = new SparkMatcher();
matcher.run("*/20 * * * * *");

app.listen(PORT ?? 5000, () => console.log(print));
