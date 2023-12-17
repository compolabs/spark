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
export const SPOT_INDEXER = "https://indexer.spark-defi.com/api/sql/composabilitylabs/spot_market_indexer";
export const CLEARING_HOUSE_INDEXER = "https://indexer.spark-defi.com/api/sql/composabilitylabs/clearing_house_indexer";
export const VAULT_INDEXER = "https://indexer.spark-defi.com/api/sql/composabilitylabs/vault_indexer";
export const PERP_MARKET_INDEXER = "https://indexer.spark-defi.com/api/sql/composabilitylabs/perp_market_indexer";
export const ACCOUNT_BALANCE_INDEXER =
	"https://indexer.spark-defi.com/api/sql/composabilitylabs/account_balance_indexer";

export const CONTRACT_ADDRESSES = {
	spotMarket: "0xe8aa3e51b255667a22ee812e5d19104022f2bc1df2d215530d503a7fb39aaaa7",
	tokenFactory: "0xc3d0426df8a40e7b4803f305537a83e7037be91596c393e7a6b693133f9d7301",
	pyth: "0x2b480dd77abdc48224a22b809608b445604f0de1a999160fb7f126cca2ffc108",
	proxy: "0xb9884461ad8d1ed48d8f6b3a9e7137f9a18b4cd3d9930286eb52cbf29e3a3318",
	accountBalance: "0x536aada5e7f8e8c8f79abacaa2cb800a2c306cd617809f60900cea9617553dd9",
	clearingHouse: "0x2f972fa6b91379690724ed3ad435d3d6ffe8da7a20a0d98fe3688bad46f44d27",
	insuranceFund: "0xb9f0919ddd0b151afb499a2fb346ce8d642db61e02ca8794fb1a50853505d2ba",
	perpMarket: "0xccc3e18425d01fc2feea10d473fd5f41f405dcd9803ff04901d19db166d18568",
	vault: "0x64bd473a174e6f535278fdc2b2b88829e8efb33e421c1b125185cc64967c34ff",
};

export interface IToken {
	logo: string;
	assetId: string;
	name: string;
	symbol: string;
	decimals: number;
	priceFeed: string;
}
