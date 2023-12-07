import tokens from "./tokens.json";
import tokenLogos from "./tokenLogos";

export const ROUTES = {
	ROOT: "/",
	CONNECT: "/connect",
	TRADE: "/:marketId",
	FAUCET: "/faucet",
};

export const TOKENS_LIST: Array<IToken> = Object.values(tokens).map((t) => ({
	...t,
	logo: tokenLogos[t.symbol],
}));
export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST.reduce((acc, t) => ({ ...acc, [t.symbol]: t }), {});
export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
	(acc, t) => ({ ...acc, [t.assetId]: t }),
	{},
);
export const TOKENS_BY_PRICE_FEED_ID: Record<string, IToken> = TOKENS_LIST.reduce(
	(acc, t) => ({ ...acc, [t.priceFeed]: t }),
	{},
);

export const NODE_URL = "https://beta-4.fuel.network/graphql";
export const EXPLORER_URL = "https://fuellabs.github.io/block-explorer-v2/beta-4/#";
export const FAUCET_URL = "https://faucet-beta-4.fuel.network";
export const TV_DATAFEED = "https://spark-tv-datafeed.spark-defi.com/api/v1";
export const CHARTS_STORAGE = "https://tv-backend-v4.herokuapp.com/";
export const SPOT_INDEXER = "https://spark-indexer.spark-defi.com/api/sql/composabilitylabs/spark_indexer";
export const CLEARING_HOUSE_INDEXER = "https://indexer.spark-defi.com/api/sql/composabilitylabs/clearing_house_indexer";

export const CONTRACT_ADDRESSES = {
	priceOracle: "0x633fad7666495c53daa41cc329b78a554f215af4b826671ee576f2a30096999d",
	spotMarket: "0x9cf9ccbf69b30530ccb62c927ed4bad12a22815a8f9e2c3a5b14f644a43889f6",
	tokenFactory: "0xa18cef5ffcdd7a1f8d83cd4bc42c6651c93e0299a8f42672f47fd74723839b7f",
	pyth: "0xc618e8adccedb6ed28c91312405666b2e753d9aa78622f801895fd550d77ff86",
	proxy: "0xac145779a245b6dcafc02aea4cc308c830403c801652ff41d2361c9876780873",
	accountBalance: "0x4f21b80d8bdc8a9468f954a3a1b634cb3c4759ab23718223c147d04a9b366b61",
	clearingHouse: "0x5d91527a587a867238f085fc0d58b0bf205c3291fea6614880b8787f5f5c000c",
	insuranceFund: "0xba819d456b4fb5671ed01681dbda6ffb8556322306fb6930a28c6db3487f2a1c",
	perpMarket: "0xd4e654e386416c9867306b697a579729c873f17cec896a7decc777e2bf2c374e",
	vault: "0x82c7b3b9c63b3470de768eb4b21a3ee88e29b9554439049163920b44697bbb4c",
};

export interface IToken {
	logo: string;
	assetId: string;
	name: string;
	symbol: string;
	decimals: number;
	priceFeed: string;
}
