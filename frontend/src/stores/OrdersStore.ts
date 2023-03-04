import RootStore from "@stores/RootStore";
import { makeAutoObservable, reaction } from "mobx";
import BN from "@src/utils/BN";
import { LimitOrdersAbi, LimitOrdersAbi__factory } from "@src/contracts";
import { CONTRACT_ADDRESSES, TOKENS_BY_ASSET_ID } from "@src/constants";
import { OrderOutput, StatusOutput } from "@src/contracts/LimitOrdersAbi";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";

export class Order {
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

  get token0() {
    return TOKENS_BY_ASSET_ID[this.asset0];
  }

  get token1() {
    return TOKENS_BY_ASSET_ID[this.asset1];
  }

  get time() {
    return dayjs(this.timestamp).format("DD-MMM MM:HH");
  }

  get fullFillPercent() {
    return this.fulfilled0.eq(0)
      ? 0
      : +this.fulfilled0.times(100).div(this.amount0).toFormat(2);
  }

  get priceFormatter() {
    const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
    const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
    const price = am1.div(am0);
    return `${price.toFormat(price.lt(0.01) ? 4 : 2)} ${this.token1.symbol}`;
  }

  get price() {
    const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
    const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
    return am1.div(am0);
  }

  get reversePrice() {
    const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
    const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
    return am0.div(am1);
  }

  get amount() {
    const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
    return am0.toFormat(am0.lt(0.01) ? 4 : 2);
  }

  get total() {
    const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
    return am1.toFormat(am1.lt(0.01) ? 4 : 2);
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
    this.init().then(() => this.setInitialized(true));
    setInterval(
      () => Promise.all([this.updateActiveOrders(), this.fetchNewOrders()]),
      10000
    );
    reaction(
      () => this.rootStore.accountStore.address,
      () =>
        Promise.all([
          this.init(),
          this.updateActiveOrders(),
          this.fetchNewOrders(),
        ])
    );
  }

  init = async () => {
    const wallet = this.rootStore.accountStore.walletToRead;
    if (wallet == null) {
      this.setInitialized(true);
      return;
    }
    this.limitOrdersContract = LimitOrdersAbi__factory.connect(
      CONTRACT_ADDRESSES.limitOrders,
      wallet
    );
    await this.fetchAllOrders();
  };
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
