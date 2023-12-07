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
	proxy: "0xd55799b76cbb58c7cc120ce7d367218dc953e43e4124f8f3699280eef7699b13",
	accountBalance: "0x0487133c13b635b3f5face640f418a1d77077cc9f05614a2575891cc92c4c72c",
	clearingHouse: "0x4ed1d590f9218d8cad08b0af38cba5967b22630e2eb5557614b54385ff8b91f1",
	insuranceFund: "0x7ef32b02db2a3bc3a02b9392a3233bae8b423e462aedacda35049add634dab5a",
	perpMarket: "0xc7b88cb130c0fb012e20247b81fb03a84716f2885605ecd1490042e94cade25d",
	vault: "0xaa77398b4909601d8a213e14d5b884dd0c62cbdb7d01752eb1cc34df412481cf",
};

export interface IToken {
	logo: string;
	assetId: string;
	name: string;
	symbol: string;
	decimals: number;
	priceFeed: string;
}
