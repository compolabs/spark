import fetchIndexer from "../src/utils/fetchIndexer";
import { Provider, Wallet } from "fuels";
import { CONTRACT_ADDRESS, NODE_URL, PRIVATE_KEY } from "../src/config";
import { SpotMarketAbi__factory as SpotMarketAbiFactory } from "../src/contracts";

const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_spark_indexer.orderentity WHERE order_id = 25 OR order_id = 26 ) t;`;

describe("get orders", () => {
  it("get orders from indexer", async () => {
    await fetchIndexer(query).then((v) => console.log(JSON.stringify(v, null, 4)));
  });

  it("get orders from contract", async () => {
    await Provider.create(NODE_URL)
      .then((provider) => Wallet.fromPrivateKey(PRIVATE_KEY, provider))
      .then((account) => SpotMarketAbiFactory.connect(CONTRACT_ADDRESS, account))
      .then((contract) => contract.functions.order_by_id(1).txParams({ gasPrice: 1 }).call())
      // .then((contract) => contract.functions.order_by_id(2).simulate())
      .then(({ value }) => console.log(value));
  }, 500000);
});
