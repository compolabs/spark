import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
import { EvmPriceServiceConnection, Price, PriceFeed } from "@pythnetwork/pyth-evm-js";
import { TOKENS_BY_SYMBOL, TOKENS_LIST } from "@src/constants";

const spotMarketsConfig = [{ t0: TOKENS_BY_SYMBOL.UNI, t1: TOKENS_BY_SYMBOL.USDC }];
const perpMarketsConfig = [
	{ to: TOKENS_BY_SYMBOL.BTC, t1: TOKENS_BY_SYMBOL.USDC },
	{ to: TOKENS_BY_SYMBOL.ETH, t1: TOKENS_BY_SYMBOL.USDC },
];

class MarketStore {
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
		const pythURL = "https://xc-mainnet.pyth.network";
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
		// You can find the ids of prices at https://pyth.network/developers/price-feed-ids
		const priceIds = TOKENS_LIST.filter((t) => t.priceFeed).map((t) => t.priceFeed);
		// const v = await connection.getPriceFeedsUpdateData(priceIds);
		await connection.subscribePriceFeedUpdates(priceIds as string[], (priceFeed: PriceFeed) => {
			const price = priceFeed.getPriceUnchecked();
			this.setPrices((prev: any) => ({ ...prev, [priceFeed.id]: price }));
		});
	};
}

export default MarketStore;
