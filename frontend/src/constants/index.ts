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

export const NODE_URL = "https://beta-4.fuel.network/graphql";
export const EXPLORER_URL = "https://fuellabs.github.io/block-explorer-v2/beta-4/#";
export const FAUCET_URL = "https://faucet-beta-4.fuel.network";
export const TV_DATAFEED = "https://spark-tv-datafeed.spark-defi.com/api/v1";
export const CHARTS_STORAGE = "https://tv-backend-v4.herokuapp.com/";
export const INDEXER = "https://spark-indexer.spark-defi.com/api/sql/composabilitylabs/spark_indexer";
export const CONTRACT_ADDRESSES = {
	priceOracle: "0x633fad7666495c53daa41cc329b78a554f215af4b826671ee576f2a30096999d",
	spotMarket: "0x9cf9ccbf69b30530ccb62c927ed4bad12a22815a8f9e2c3a5b14f644a43889f6",
	tokenFactory: "0xa18cef5ffcdd7a1f8d83cd4bc42c6651c93e0299a8f42672f47fd74723839b7f",
	proxy : "0xbcad46ea09bfc75a68346c11bfbb66714b8b7d735d1d0fd7c1f838768406e594",
	accountBalance : "0xec13e0346f85bfb140c5b6ad3683788e7b28e37f82fd3e8d82f677d2a5a1904a",
	clearingHouse : "0xc29013d8917fed3ece90d65e0ba538283ad95c16e5a86a146d0f20fe1ff6712f",
	insuranceFund : "0x2b1c55128e89206a371e570afa57e39423b8607f6a65b7c9a73d404a9d08792d",
	perpMarket : "0x485a91e8ee2f4be344e50e6e3c78b4a5bcc25c699eeef986834ee7166fddca9e",
	vault : "0x19648521ebca1d73e8bf703c29e13dd4d25ad3b992f5fa866df415b290069012",
	pyth : "0xc618e8adccedb6ed28c91312405666b2e753d9aa78622f801895fd550d77ff86",
};


export interface IToken {
	logo: string;
	assetId: string;
	name: string;
	symbol: string;
	decimals: number;
	priceFeed: string;
}

