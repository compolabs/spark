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
export const VAULT_INDEXER = "https://indexer.spark-defi.com/api/sql/composabilitylabs/vault_indexer";
export const PERP_MARKET_INDEXER = "https://indexer.spark-defi.com/api/sql/composabilitylabs/perp_market_indexer";
export const ACCOUNT_BALANCE_INDEXER =
	"https://indexer.spark-defi.com/api/sql/composabilitylabs/account_balance_indexer";

export const CONTRACT_ADDRESSES = {
	priceOracle: "0x633fad7666495c53daa41cc329b78a554f215af4b826671ee576f2a30096999d",
	spotMarket: "0x9cf9ccbf69b30530ccb62c927ed4bad12a22815a8f9e2c3a5b14f644a43889f6",
	tokenFactory: "0xa18cef5ffcdd7a1f8d83cd4bc42c6651c93e0299a8f42672f47fd74723839b7f",
	pyth: "0xc618e8adccedb6ed28c91312405666b2e753d9aa78622f801895fd550d77ff86",
	proxy: "0x64d278b21248a96a88060bbd5fc65c6d0a05b9ac71239d210d8b0d27d58774bd",
	accountBalance: "0x09c545a710d5f5865bc12009922599d663353c3052c577ecbe71c5bec3abb221",
	clearingHouse: "0xd40309a4b64c9566645e4af65ad037dda1c3cccde0da3f32076fe0a5924b8b93",
	insuranceFund: "0x291d9a3b7e6c26fe470835ca2afcd687f84a2f8d06a00a6ca9a148a52c3e1b36",
	perpMarket: "0x85fb6478f0e75f7fdfee44058af9cbc6f837829f9c7bfdaecee245979581981e",
	vault: "0x44263c73f0c7cbeb281fd41d7c3c5bdf78b333be9d3fa275a3d547450d4ac167",
};

export interface IToken {
	logo: string;
	assetId: string;
	name: string;
	symbol: string;
	decimals: number;
	priceFeed: string;
}
