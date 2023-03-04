import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import BN from "@src/utils/BN";
import { Provider, Wallet } from "fuels";
import {
  CONTRACT_ADDRESSES,
  IToken,
  NODE_URL,
  SEED,
  TOKENS_LIST,
} from "@src/constants";
import { OracleAbi__factory } from "@src/contracts";

class PricesStore {
  public readonly rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    // this.updateTokenPrices().then();
    // setInterval(this.updateTokenPrices, 60 * 1000);
    // reaction(
    //   () => this.rootStore.accountStore.address,
    //   () => this.updateTokenPrices()
    // );
  }

  tokensPrices: Record<string, BN> | null = null;
  setTokensPrices = (v: Record<string, BN>) => (this.tokensPrices = v);

  getTokenPrice = (assetId: string) => {
    if (this.tokensPrices == null) return BN.ZERO;
    const price = this.tokensPrices[assetId];
    return price == null ? BN.ZERO : price;
  };

  getFormattedTokenPrice = (token: IToken): string => {
    if (this.tokensPrices == null) return "$ 0.00";
    const price = this.tokensPrices[token.assetId];
    return "$" + price.toFormat(2);
  };

  updateTokenPrices = async () => {
    //todo fix to one type of call and new  oracleContracts.get_prices
    //todo fix without seed

    //todo fix this
    const { address } = this.rootStore.accountStore;
    if (address == null) return;
    const checkWallet = Wallet.fromSeed(SEED, "", new Provider(NODE_URL));

    try {
      const oracleContracts = TOKENS_LIST.map(() =>
        OracleAbi__factory.connect(CONTRACT_ADDRESSES.limitOrders, checkWallet)
      );
      const ids = TOKENS_LIST.map((t) => {
        return { value: t.assetId };
      });
      const response = await Promise.all(
        oracleContracts.map((v, index) =>
          v.functions.get_price(ids[index]).simulate()
        )
      );
      if (response.length > 0) {
        const v = response.reduce(
          (acc, { value }) => ({
            ...acc,
            [value.asset_id.value]: BN.formatUnits(value.price.toString(), 9),
          }),
          {}
        );
        this.setTokensPrices(v);
      }
    } catch (e) {
      console.log(e);
    }
  };
}

export default PricesStore;
