import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
import { EvmPriceServiceConnection, Price, PriceFeed } from "@pythnetwork/pyth-evm-js";
import { TOKENS_BY_SYMBOL, TOKENS_LIST } from "@src/constants";
import { Bytes } from "fuels";
import { Vec } from "@src/contracts/common";
import axios from "axios";

class OracleStore {
	public rootStore: RootStore;

	pythClient: any | null = null;
	private setPythClient = (l: any) => (this.pythClient = l);

	prices: Record<string, Price> | {} = {};
	private setPrices = (v: Record<string, Price> | {}) => (this.prices = v);

	updateData: Vec<Bytes> | null = null;
	private setUpdateData = (v: Vec<Bytes>) => (this.updateData = v);

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);

		this.initAndGetPythPrices();
	}

	getPriceData = async (): Promise<string[]> => {
		const ETH_USD_PRICE_FEED_ID = TOKENS_BY_SYMBOL.ETH.priceFeed;
		const USDC_USD_PRICE_FEED_ID = TOKENS_BY_SYMBOL.USDC.priceFeed;
		const BTC_USD_PRICE_FEED_ID = TOKENS_BY_SYMBOL.BTC.priceFeed;
		const pythURL = `https://xc-mainnet.pyth.network/api/latest_vaas?ids[]=${ETH_USD_PRICE_FEED_ID}&ids[]=${USDC_USD_PRICE_FEED_ID}&ids[]=${BTC_USD_PRICE_FEED_ID}`;
		const v = await axios.get(pythURL);
		return v.data ?? [];
	};

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
		const updateData = await connection.getPriceFeedsUpdateData(priceIds);
		console.log(updateData);
		// console.log("updateData", updateData);

		// const parsedUpdateData = updateData.map( v =>
		// 	 Uint8Array.from(v.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))
		// );
		// const parsedUpdateData = updateData.map((v) => Uint8Array.from(atob(v), (c) => c.charCodeAt(0)));
		// this.setUpdateData(parsedUpdateData);
		const data = await this.getPriceData();
		console.log(data);
		const parsedUpdateData = data.map((v) => Uint8Array.from(v.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))));
		this.setUpdateData(parsedUpdateData);

		await connection.subscribePriceFeedUpdates(priceIds as string[], (priceFeed: PriceFeed) => {
			const price = priceFeed.getPriceUnchecked();
			this.setPrices((prev: any) => ({ ...prev, [priceFeed.id]: price }));
		});
	};
}

export default OracleStore;
