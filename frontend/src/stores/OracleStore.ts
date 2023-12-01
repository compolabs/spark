import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
import { EvmPriceServiceConnection, Price, PriceFeed } from "@pythnetwork/pyth-evm-js";
import { CONTRACT_ADDRESSES, TOKENS_LIST } from "@src/constants";
import { arrayify, Bytes } from "fuels";
import { Vec } from "@src/contracts/common";
import { PythContractAbi__factory } from "@src/contracts";

class OracleStore {
	public rootStore: RootStore;

	pythClient: any | null = null;
	private setPythClient = (l: any) => (this.pythClient = l);

	prices: Record<string, Price> | {} = {};
	private setPrices = (v: Record<string, Price> | {}) => (this.prices = v);

	updateData: Vec<Bytes> | null = null;
	private setUpdateData = (v: Vec<Bytes>) => (this.updateData = v);

	feePrice: number = 0;
	private setFeePrice = (v: number) => (this.feePrice = v);

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
		const updateData = await connection.getPriceFeedsUpdateData(priceIds);
		const parsedUpdateData = updateData.map((v) => Array.from(arrayify(v)));
		this.setUpdateData(parsedUpdateData);

		await connection.subscribePriceFeedUpdates(priceIds as string[], (priceFeed: PriceFeed) => {
			const price = priceFeed.getPriceUnchecked();
			this.setPrices((prev: any) => ({ ...prev, [priceFeed.id]: price }));
		});
	};
	getPythFee = async () => {
		const { accountStore } = this.rootStore;
		const wallet = await accountStore.getWallet();
		if (wallet == null || this.updateData == null) return;
		const pythContractAbi = PythContractAbi__factory.connect(CONTRACT_ADDRESSES.pyth, wallet);
		const fee = await pythContractAbi.functions.update_fee(this.updateData).simulate();
		return fee.value.toString() ?? "0";
	};
}

export default OracleStore;
