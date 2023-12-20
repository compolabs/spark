import { Provider, sleep, Wallet } from "fuels";
import { schedule } from "node-cron";
import { app } from "./app";
import { IOrder, IOrderResponse, orderOutputToIOrder } from "./models/Order";
import { CONTRACT_ADDRESS, NODE_URL, PORT, PRIVATE_KEY } from "./config";
import { SpotMarketAbi, SpotMarketAbi__factory as SpotMarketAbiFactory } from "./contracts";
import fetchIndexer from "./utils/fetchIndexer";
import BN from "./utils/BN";

enum STATUS {
  RUNNING,
  CHILLED,
}

const okErrors: Array<string> = [];

class SparkMatcher {
  private contract?: SpotMarketAbi;
  private initialized = true;
  private status = STATUS.CHILLED;
  private processing: number[] = [];
  private skipCounter = 0;

  constructor() {
    console.log({ NODE_URL });
    Provider.create(NODE_URL)
      .then((provider) => Wallet.fromPrivateKey(PRIVATE_KEY, provider))
      .then((account) => (this.contract = SpotMarketAbiFactory.connect(CONTRACT_ADDRESS, account)));
  }

  run(cronExpression: string) {
    schedule(cronExpression, async () => {
      if (this.skipCounter > 30) {
        console.log("⏰ Job stop due timeout");
        this.processing = [];
        this.status = STATUS.CHILLED;
        this.skipCounter = 0;
      }

      if (this.status === STATUS.CHILLED) {
        this.status = STATUS.RUNNING;
        await this.doMatch()
          .catch((e) => console.log(e.toString()))
          .finally(() => {
            this.processing = [];
            this.status = STATUS.CHILLED;
            this.skipCounter = 0;
          });
      } else {
        this.skipCounter += 1;
        console.log("🍃 Job already running, skip");
      }
    }).start();
  }

  public doMatch = async () => {
    if (this.contract == null) return;

    console.log("🛫 Job start");
    const promises = [];
    if (!this.initialized) throw new Error("SparkMatcher is not initialized");

    const activeOrders: Array<IOrder> = await fetchIndexer<Array<IOrderResponse>>(
      `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_spot_market_indexer.orderentity WHERE status = 'Active') t;`
    ).then((result) => (result != null ? result.map(orderOutputToIOrder) : []));

    const totalOrders: number = await fetchIndexer<Array<{ count: number }>>(
      `SELECT json_agg(t) FROM (SELECT COUNT(id) FROM composabilitylabs_spot_market_indexer.orderentity) t;`
    ).then((res) => (res && res[0] ? res[0].count : -1));

    console.log(
      `Buy orders: ${activeOrders.filter((o) => o.type === "BUY").length}`,
      `| Sell orders: ${
        activeOrders.filter((o) => o.type === "SELL").length
      } | Total orders: ${totalOrders}`
    );

    for (const i in activeOrders) {
      for (const j in activeOrders) {
        const [order0, order1] = [activeOrders[i], activeOrders[j]];
        if (
          ((order0.type === "BUY" && order1.type === "SELL" && order1.price <= order0.price) ||
            (order1.type === "BUY" && order0.type === "SELL" && order0.price <= order1.price)) &&
          order0.status === "Active" &&
          order1.status === "Active" &&
          this.processing.indexOf(order1.orderId) === -1 &&
          new BN(order0.amount0).minus(order0.fulfilled0).gt(0) &&
          new BN(order0.amount1).minus(order0.fulfilled1).gt(0) &&
          new BN(order1.amount0).minus(order1.fulfilled0).gt(0) &&
          new BN(order1.amount1).minus(order1.fulfilled1).gt(0)
        ) {
          const orders = await Promise.all([
            await this.contract.functions
              .order_by_id(order0.orderId)
              .simulate()
              .catch(console.error),
            await this.contract.functions
              .order_by_id(order1.orderId)
              .simulate()
              .catch(console.error),
          ]);
          const isOrdersActive = orders.every((res) => res != null && res.value.status == "Active");
          await sleep(1000);
          if (!isOrdersActive) {
            console.log(
              `🛸👽 Phantom order \nOrder #${order0.orderId}\n indexer status: ${
                orders[0] && orders[0].value.status
              }\n real status: ${order0.status} \nOrder #${order1.orderId}\n indexer status:${
                orders[1] && orders[1].value.status
              }\n real status: ${order1.status} `
            );
            continue;
          }
          let asset0 = order0.asset0;
          let asset1 = order0.asset1;
          console.log(
            `\n${order0.type} Order #${order0.orderId}: ${BN.formatUnits(
              new BN(order0.amount0).minus(order0.fulfilled0),
              asset0.decimals
            )} ${asset0.symbol} -> ${BN.formatUnits(
              new BN(order0.amount1).minus(order0.fulfilled1),
              asset1.decimals
            )} ${asset1.symbol}`
          );

          asset0 = order1.asset0;
          asset1 = order1.asset1;
          console.log(
            `${order1.type} Order #${order1.orderId}: ${BN.formatUnits(
              new BN(order1.amount0).minus(order1.fulfilled0),
              asset0.decimals
            )} ${asset0.symbol} -> ${BN.formatUnits(
              new BN(order1.amount1).minus(order1.fulfilled1),
              asset1.decimals
            )} ${asset1.symbol}`
          );
          this.processing.push(order0.orderId);
          this.processing.push(order1.orderId);
          const promise = await this.contract.functions
            .match_orders(order0.orderId, order1.orderId)
            .txParams({ gasPrice: 2 })
            .call()
            .then(() => console.log(`✅ ${order0.orderId} + ${order1.orderId}`))
            .catch((e) => {
              if (e.reason) {
                const status = okErrors.includes(e.reason) ? "✅" : "❌";
                console.log(`${status} ${order0.orderId} + ${order1.orderId} ${e.reason}`);
              } else if (e.name && e.cause && e.cause.logs && e.cause.logs[0]) {
                console.log(
                  `❌ ${order0.orderId} + ${order1.orderId}: ${e.name}: ${e.cause.logs[0] ?? ""}`
                );
              } else if (/"reason": "(.+)"/.test(e.toString())) {
                const reason = e.toString().match('"reason": "(.+)"')[1];
                console.log(`❌ ${order0.orderId} + ${order1.orderId}: ${reason}`);
              } else {
                console.log(`❌ ${order0.orderId} + ${order1.orderId}: ${e.toString()}`);
                Object.entries(e);
              }
            })
            .finally(() => {
              const index0 = this.processing.indexOf(order0.orderId);
              const index1 = this.processing.indexOf(order1.orderId);
              index0 !== -1 && this.processing.splice(index0, 1);
              index1 !== -1 && this.processing.splice(index1, 1);
            });
          promises.push(promise);
        }
      }
    }

    console.log("🏁 Job finish");
    // await Promise.all(promises).then(() => {
    //   console.log("🏁 Job finish");
    //   resolve();
    // });
  };
}

const matcher = new SparkMatcher();
matcher.run("*/20 * * * * *");

const print = `

 ██████╗ ██████╗ ███╗   ███╗██████╗  ██████╗ ███████╗ █████╗ ██████╗ ██╗██╗     ██╗████████╗██╗   ██╗
██╔════╝██╔═══██╗████╗ ████║██╔══██╗██╔═══██╗██╔════╝██╔══██╗██╔══██╗██║██║     ██║╚══██╔══╝╚██╗ ██╔╝
██║     ██║   ██║██╔████╔██║██████╔╝██║   ██║███████╗███████║██████╔╝██║██║     ██║   ██║    ╚████╔╝ 
██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║   ██║╚════██║██╔══██║██╔══██╗██║██║     ██║   ██║     ╚██╔╝  
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ╚██████╔╝███████║██║  ██║██████╔╝██║███████╗██║   ██║      ██║   
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝      ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝╚══════╝╚═╝   ╚═╝      ╚═╝   
                                                                                                     
██╗      █████╗ ██████╗ ███████╗                                                                     
██║     ██╔══██╗██╔══██╗██╔════╝                                                                     
██║     ███████║██████╔╝███████╗                                                                     
██║     ██╔══██║██╔══██╗╚════██║                                                                     
███████╗██║  ██║██████╔╝███████║                                                                     
╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝                                                                     
                                                                                                     
${"🚀 Server ready at: http://localhost:" + (PORT ?? 5000)}       `;

app.listen(PORT ?? 5000, () => console.log(print));
