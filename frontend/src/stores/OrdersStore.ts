import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import BN from "@src/utils/BN";
import { LimitOrdersAbi, LimitOrdersAbi__factory } from "@src/contracts";
import { CONTRACT_ADDRESSES } from "@src/constants";
import { OrderOutput, StatusOutput } from "@src/contracts/LimitOrdersAbi";

class Order {
  asset0: string;
  amount0: BN;
  asset1: string;
  amount1: BN;
  status: StatusOutput;
  fulfilled0: BN;
  fulfilled1: BN;
  owner: string;
  id: string;
  timestamp: string;
  matcher_fee: BN;
  matcher_fee_used: BN;

  constructor(orderOutput: OrderOutput) {
    this.id = orderOutput.id.toString();
    this.asset0 = orderOutput.asset0.value;
    this.amount0 = new BN(orderOutput.amount0.toString());
    this.asset1 = orderOutput.asset1.value;
    this.amount1 = new BN(orderOutput.amount1.toString());
    this.status = orderOutput.status;
    this.fulfilled0 = new BN(orderOutput.fulfilled0.toString());
    this.fulfilled1 = new BN(orderOutput.fulfilled1.toString());
    this.owner = orderOutput.owner.value;
    this.timestamp = orderOutput.timestamp.toString();
    this.matcher_fee = new BN(orderOutput.matcher_fee.toString());
    this.matcher_fee_used = new BN(orderOutput.matcher_fee_used.toString());
  }
}

class OrdersStore {
  public readonly rootStore: RootStore;
  orders: Order[] = [];
  limitOrdersContract: LimitOrdersAbi | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    if (this.rootStore.accountStore.address == null) return;
    const wallet = this.rootStore.accountStore.walletToRead;
    if (wallet == null) return;
    this.limitOrdersContract = LimitOrdersAbi__factory.connect(
      CONTRACT_ADDRESSES.limitOrders,
      wallet
    );
    this.fetchAllOrders(); //.then(() => console.log(this.orders));
  }

  async fetchAllOrders() {
    const orders: Order[] = [];
    let offset = 0;
    if (this.limitOrdersContract == null) return;
    while (
      offset === 0 ||
      (orders.length > 0 && new BN(orders[orders.length - 1].id).gt(1))
    ) {
      let res = await this.limitOrdersContract.functions.orders(offset).get();
      let batch = res.value
        .filter((v) => v != null)
        .map((v) => new Order(v as OrderOutput));
      orders.push(...batch);
      offset += 10;
    }
    this.orders = orders;
  }
}

export default OrdersStore;
