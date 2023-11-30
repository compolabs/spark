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
	accountBalance : "0x52b6cd88c7ce50c3b58650de9be6dd2406f7a4d4fb35f70568d766581fd3b3bd",
	clearingHouse : "0x7efc0b1051f3162357a84b9ba83ae12a6544f2541e95cfc44a000bfd421132a7",
	insuranceFund : "0x4e56c69c726d1daed6504d112ef3f72a43e948713f675e577a62690ad3e0abce",
	perpMarket : "0x03779723bd446f4985db2ca360707b8a513b0436e5bf3c8cd991ebdb1026de61",
	vault : "0xf15858671e39d7547fd45a20bc84bd5c12e61670195fa4bb020a1e4ac7bfe885",
};

// proxy = 0xb5f82e4611824d940ee98d7754f979ee502f8f3ecbd1450637e59ff0a70d6592
// proxy = "fuel1khuzu3s3sfxegrhf34m4f7teaegzlre7e0g52p3huk0lpfcdvkfq8rq5qc"
//
// account_balance = 0x52b6cd88c7ce50c3b58650de9be6dd2406f7a4d4fb35f70568d766581fd3b3bd
// account_balance = "fuel122mvmzx8eegv8dvx2r0fhekaysr00fx5lv6lwptg6an9s87nkw7sm2wkkl"
//
// clearing_house = 0x7efc0b1051f3162357a84b9ba83ae12a6544f2541e95cfc44a000bfd421132a7
// clearing_house = "fuel10m7qkyz37vtzx4agfwd6swhp9fj5fuj5r62ul3z2qq9l6ss3x2nsc4h9up"
//
// insurance_fund = 0x4e56c69c726d1daed6504d112ef3f72a43e948713f675e577a62690ad3e0abce
// insurance_fund = "fuel1fetvd8rjd5w6a4jsf5gjaulh9fp7jjr38an4u4m6vf5s45lq408qygptc4"
//
// perp_market = 0x03779723bd446f4985db2ca360707b8a513b0436e5bf3c8cd991ebdb1026de61
// perp_market = "fuel1qdmewgaag3h5npwm9j3kqurm3fgnkppkuklnerxej84akypxmesseuv6gh"
//
// vault = 0xf15858671e39d7547fd45a20bc84bd5c12e61670195fa4bb020a1e4ac7bfe885
// vault = "fuel179v9sec788t4gl75tgstep9atsfwv9nsr906fwczpg0y43alazzs57ucp2"

export interface IToken {
	logo: string;
	assetId: string;
	name: string;
	symbol: string;
	decimals: number;
	priceFeed: string;
}

