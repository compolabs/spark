// import { initMongo } from "../src/services/mongoService";
// import { Order } from "../src/models/Order";

describe("items", () => {
  // beforeAll(() => initMongo());
  it("🚑 Emergency cancel of orders", async () => {
    // const orders = await Order.find({
    //   status: "Active",
    //   owner: "0x2ce05bde9ada2d2c58b5eb9f08be34df19375d618626c324f75dfdbd226c8d88",
    // });
    // const wallet = Wallet.fromPrivateKey(privateKey, nodeUrl);
    // const limitOrdersContract = LimitOrdersAbi__factory.connect(contractAddress, wallet);
    // await Promise.all(
    //   orders.map((o) =>
    //     limitOrdersContract.functions
    //       .cancel_order(o.id)
    //       .txParams({ gasPrice: 1 })
    //       .call()
    //       .then(() => console.log(`✅ Order ${o.id} canceled`))
    //       .catch((e) => console.log(`❌ Order ${o.id} cancel error\n`, e))
    //   )
    // );
  });
  it("test", async () => {
    // console.log(await Order.count());
    // console.log(await Order.count());
    //activeOrders[i].status === "Active" &&
    //             activeOrders[j].status === "Active"
    // console.log(
    //   await Order.findOne({ id: 1 })
    //     .select({ _id: false, status: true })
    //     .then((order) => order?.status === "Active")
    // );
  });
  it("print db", async () => {
    // const orders = await Order.find({});
    // // console.dir(orders, { maxArrayLength: null });
    // console.dir(
    //   orders.filter((o) => o.id > 100).map((o) => o.id),
    //   { maxArrayLength: null }
    // );
  }, 500000);
  it("drop db", async () => {
    // await Order.deleteMany();
  }, 500000);
});
