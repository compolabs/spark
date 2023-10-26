import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
import { EvmPriceServiceConnection, Price, PriceFeed } from "@pythnetwork/pyth-evm-js";
import { TOKENS_BY_SYMBOL } from "@src/constants";

class OracleStore {
	public rootStore: RootStore;

	pythClient: any | null = null;
	private setPythClient = (l: any) => (this.pythClient = l);

	prices: Record<string, Price> | {} = {};
	private setPrices = (v: Record<string, Price> | {}) => (this.prices = v);

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);

		this.initAndGetPythPrices();
	}

	initAndGetPythPrices = async () => {
		const pythURL = "https://hermes-beta.pyth.network";
		const connection = new EvmPriceServiceConnection(pythURL, {
			logger: {
				error: console.error,
				warn: console.warn,
				info: () => undefined,
				debug: () => undefined,
				trace: () => undefined,
			},
		});
		this.setPythClient(connection);
		// const priceIds = TOKENS_LIST.filter((t) => t.priceFeed).map((t) => t.priceFeed);
		const priceIds = [TOKENS_BY_SYMBOL.ETH.priceFeed];
		await connection.subscribePriceFeedUpdates(priceIds as string[], (priceFeed: PriceFeed) => {
			const price = priceFeed.getPriceUnchecked();
			this.setPrices((prev: any) => ({ ...prev, [priceFeed.id]: price }));
		});
	};
}

export default OracleStore;
