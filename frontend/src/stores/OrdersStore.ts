import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import BN from "@src/utils/BN";
import { LimitOrdersAbi, LimitOrdersAbi__factory } from "@src/contracts";
import { CONTRACT_ADDRESSES, TOKENS_BY_ASSET_ID } from "@src/constants";
import { OrderOutput, StatusOutput } from "@src/contracts/LimitOrdersAbi";
import BigNumber from "bignumber.js";

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

  get symbol0() {
    return TOKENS_BY_ASSET_ID[this.asset0].symbol;
  }

  get symbol1() {
    return TOKENS_BY_ASSET_ID[this.asset1].symbol;
  }
}

class OrdersStore {
  public readonly rootStore: RootStore;
  orders: Order[] = [];
  limitOrdersContract: LimitOrdersAbi | null = null;

  initialized: boolean = false;
  private setInitialized = (l: boolean) => (this.initialized = l);

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
    this.fetchAllOrders().then(() => {
      this.setInitialized(true);
      console.log("✅ initialized");
    });
    setInterval(
      () => Promise.all([this.updateActiveOrders(), this.fetchNewOrders()]),
      10000
    );
  }

  fetchAllOrders = async () => {
    let ordersAmount = await this.getOrdersAmount();
    if (this.limitOrdersContract === null || ordersAmount == null) return;
    let functions = this.limitOrdersContract.functions;
    const length = new BN(ordersAmount.toString())
      .div(10)
      .toDecimalPlaces(0, BigNumber.ROUND_CEIL)
      .toNumber();
    let chunks = await Promise.all(
      Array.from({ length }, (_, i) =>
        functions
          .orders(i * 10)
          .get()
          .then((res) =>
            res.value
              .filter((v) => v != null)
              .map((v) => new Order(v as OrderOutput))
          )
      )
    );
    this.orders = chunks.flat();
  };

  fetchNewOrders = async () => {
    let ordersAmount = await this.getOrdersAmount();
    let functions = this.limitOrdersContract?.functions;
    let ordersLength = this.orders.length;
    if (functions == null || ordersAmount == null || ordersLength === 0) return;
    let firstOrderId = this.orders[0].id;
    let length = new BN(ordersAmount.toString())
      .minus(ordersLength)
      .div(10)
      .toDecimalPlaces(0, BigNumber.ROUND_CEIL)
      .toNumber();
    if (length === 0) return;
    let chunks = await Promise.all(
      Array.from({ length }, (_, i) =>
        functions!
          .orders(i * 10)
          .get()
          .then((res) =>
            res.value
              .filter((v) => v != null && v.id.gt(firstOrderId))
              .map((v) => new Order(v as OrderOutput))
          )
      )
    );
    this.orders = [...chunks.flat(), ...this.orders];
  };

  updateActiveOrders = async () => {
    let functions = this.limitOrdersContract?.functions;
    if (functions == null) return;
    const activeOrders = this.orders.filter((o) => o.status.Active != null);
    const chunks = sliceIntoChunks(activeOrders, 10).map((chunk) =>
      chunk
        .map((o) => o.id.toString())
        .concat(Array(10 - chunk.length).fill("0"))
    );
    let res = await Promise.all(
      chunks.map((chunk) =>
        functions
          ?.orders_by_id(chunk as any)
          .get()
          .then((res) => res.value)
      )
    );
    res.flat().forEach((order) => {
      if (order != null) {
        const i = this.orders.findIndex((o) => o.id === order.id.toString());
        this.orders[i] = new Order(order);
      }
    });
  };

  /*
     pub async fn update_active_orders(&mut self) {
          let mut active_orders: Vec<(u64, u64)> = vec![]; // (index, id)
          let mut i = 0;
          while i < self.orders.len() {
              let order = self.orders[i].clone();
              if order.status == Status::Active {
                  active_orders.push((i as u64, order.id));
              }
              i += 1;
          }
          let chanks: Vec<Vec<(u64, u64)>> = active_orders.chunks(10).map(|s| s.into()).collect();
          for chank in chanks {
              let mut arr: [u64; 10] = pad_zeroes([]);
              let mut i = 0;
              while i < chank.len() {
                  arr[i] = chank[i].1;
                  i += 1;
              }
              let res = orders_by_id(&self.instance, arr).await.to_vec();
              let mut i = 0;
              while i < res.len() {
                  if res[i].is_some() {
                      let index = chank[i].0;
                      let array_index = usize::try_from(index).unwrap();
                      let order = res[i].clone().unwrap();
                      self.orders[array_index] = order;
                  }
                  i += 1;
              }
          }
      }
    * */

  getOrdersAmount = () =>
    this.limitOrdersContract?.functions
      .orders_amount()
      .get()
      .then((res) => res.value);
}

function sliceIntoChunks<T>(arr: T[], chunkSize: number): T[][] {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

export default OrdersStore;
