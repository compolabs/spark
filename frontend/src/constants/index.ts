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
	pyth: "0xc618e8adccedb6ed28c91312405666b2e753d9aa78622f801895fd550d77ff86",
	proxy: "0x01ed7ab35c98c6611d5969b0e1d874c7bb42dd21378834f553410d9d527ba089",
	accountBalance: "0xe1f03592db550772279f4ebefbd5217de7a51fc2e97eeaecf2da743c2cd079fe",
	clearingHouse: "0x07811220c5b2e69c525d7a876c7a20a941584ee8243eb41082e93ed76d1a72dd",
	insuranceFund: "0xe2aa4ba61b734b75c6ff4549544bbba9129dc2b0c22b71145e854040d19fee5f",
	perpMarket: "0xd45d21374e7b8f7ecdc19e1261b7b5da3610bc14944315af6cc117215c637ae5",
	vault: "0x401a7b5ee25b9dadc9fc971a132966e7c4cf13945f9af482adebffd39f778b12",
};

export interface IToken {
	logo: string;
	assetId: string;
	name: string;
	symbol: string;
	decimals: number;
	priceFeed: string;
}
