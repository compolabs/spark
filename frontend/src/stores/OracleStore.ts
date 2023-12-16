import { makeAutoObservable } from "mobx";
import RootStore from "@stores/RootStore";
import { EvmPriceServiceConnection, Price, PriceFeed } from "@pythnetwork/pyth-evm-js";
import { CONTRACT_ADDRESSES, TOKENS_BY_SYMBOL, TOKENS_LIST } from "@src/constants";
import { arrayify, Bytes } from "fuels";
import { Vec } from "@src/contracts/common";
import { PythContractAbi__factory } from "@src/contracts";
import BN from "@src/utils/BN";

//todo change get fee to amount of perp markets
class OracleStore {
	public rootStore: RootStore;

	pythClient: any | null = null;
	private setPythClient = (l: any) => (this.pythClient = l);

	prices: Record<string, Price> | null = null;
	private setPrices = (v: Record<string, Price>) => (this.prices = v);

	updateData: Vec<Bytes> | null = null;
	private setUpdateData = (v: Vec<Bytes>) => (this.updateData = v);

	feePrice: number = 0;
	private setFeePrice = (v: number) => (this.feePrice = v);

	initialized: boolean = false;
	private setInitialized = (l: boolean) => (this.initialized = l);

	constructor(rootStore: RootStore) {
		makeAutoObservable(this);
		this.rootStore = rootStore;
		this.initAndGetPythPrices().then(() => this.setInitialized(true));
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
		// const priceIds = TOKENS_LIST.filter((t) => t.priceFeed).map((t) => t.priceFeed);
		//todo make dynamic
		const priceIds = [TOKENS_BY_SYMBOL.BTC.priceFeed, TOKENS_BY_SYMBOL.USDC.priceFeed];
		const updateData = await connection.getPriceFeedsUpdateData(priceIds);
		const parsedUpdateData = updateData.map((v) => Array.from(arrayify(v)));
		this.setUpdateData(parsedUpdateData);
		const res = await connection.getLatestPriceFeeds(priceIds);

		const initPrices = res?.reduce((acc, priceFeed) => {
			const price = priceFeed.getPriceUnchecked();
			return { ...acc, [`0x${priceFeed.id}`]: price };
		}, {} as any);
		this.setPrices(initPrices);

		await connection.subscribePriceFeedUpdates(priceIds, (priceFeed: PriceFeed) => {
			const price = priceFeed.getPriceUnchecked();
			this.setPrices({ ...this.prices, [`0x${priceFeed.id}`]: price });
		});
	};
	getPythFee = async () => {
		const { accountStore } = this.rootStore;
		const wallet = await accountStore.getWallet();
		if (wallet == null || this.updateData == null) return null;
		const pythContractAbi = PythContractAbi__factory.connect(CONTRACT_ADDRESSES.pyth, wallet);
		const fee = await pythContractAbi.functions.update_fee(this.updateData).simulate();
		return fee.value.toNumber() ?? 3;
	};

	getTokenIndexPrice(priceFeed: string): BN {
		if (this.prices == null) return BN.ZERO;
		const price = this.prices[priceFeed];
		const v = BN.formatUnits(price?.price, 2);
		return price?.price == null ? BN.ZERO : v;
	}

	get tokenIndexPrice(): BN {
		const { market } = this.rootStore.tradeStore;
		const token = market?.token0;
		if (token == null) return BN.ZERO;
		return this.getTokenIndexPrice(token?.priceFeed);
	}
}

export default OracleStore;
