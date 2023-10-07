import tokens from "./tokens.json";
import tokenLogos from "./tokenLogos";

export const ROUTES = {
    ROOT: "/",
};

export const TOKENS_LIST: Array<IToken> = Object.values(tokens).map((t) => ({
    ...t,
    logo: tokenLogos[t.symbol],
}));
export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST.reduce(
    (acc, t) => ({...acc, [t.symbol]: t}),
    {}
);
export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
    (acc, t) => ({...acc, [t.assetId]: t}),
    {}
);

export const NODE_URL = "https://beta-4.fuel.network/graphql";
export const EXPLORER_URL =
    "https://fuellabs.github.io/block-explorer-v2/beta-4/#";
export const FAUCET_URL = "https://faucet-beta-4.fuel.network";
export const TV_DATAFEED = "https://spark-tv-datafeed.spark-defi.com/api/v1";
export const CHARTS_STORAGE = "https://tv-backend-v4.herokuapp.com/";
export const CONTRACT_ADDRESSES = {
    priceOracle:
        "0x633fad7666495c53daa41cc329b78a554f215af4b826671ee576f2a30096999d",
    spotMarket: "0x76deb3f6b418d3037150ba8ea6734a6cb7906bf8a518739b7f6b735ce5831946",
    tokenFactory:
        "0xd8c627b9cd9ee42e2c2bd9793b13bc9f8e9aad32e25a99ea574f23c1dd17685a",
};

export interface IToken {
    logo: string;
    assetId: string;
    name: string;
    symbol: string;
    decimals: number;
}

export interface IContractsConfig {
    priceOracle: string;
    market: string;
    tokenFactory: string;
}
