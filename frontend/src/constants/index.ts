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
	tokenFactory: "0xc3d0426df8a40e7b4803f305537a83e7037be91596c393e7a6b693133f9d7301",
	pyth: "0x2b480dd77abdc48224a22b809608b445604f0de1a999160fb7f126cca2ffc108",
	proxy: "0x45f4523ea213a07fb6e6224fd9df4e7419b83539ac852f2f696c649ffaa4d352",
	accountBalance: "0x0b1f3bfc922c6dc3afded60534fd6ee4ce18a2997ca40f3655251bd632f5d8e3",
	clearingHouse: "0xbf2300a00b13ed67f7f89595c50064c643a9aab59c1eb15daa0c0481427a4d5d",
	insuranceFund: "0x20d1ce5d201508bbf9ce89790662f0e93eed8cea496690a422fc94c6cec028d4",
	perpMarket: "0x7893e011627191efa82851c8a39ff0765d1a1d97526b9d5c2e5e679d13689bbf",
	vault: "0xa31cbf2d1e1ca5c097bf27b1f5d9af20b084e42fd53ff2e28ccc2cd52ddd5cc6",
};

export interface IToken {
	logo: string;
	assetId: string;
	name: string;
	symbol: string;
	decimals: number;
	priceFeed: string;
}
