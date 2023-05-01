import tokens from "./tokens.json";
import tokenLogos from "./tokenLogos";

export const ROUTES = {
  TRADE: "/",
  FAUCET: "/faucet",
  WALLET: "/wallet",
};

export const TOKENS_LIST: Array<IToken> = Object.values(tokens).map((t) => ({
  ...t,
  logo: tokenLogos[t.symbol],
}));
export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.symbol]: t }),
  {}
);
export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.assetId]: t }),
  {}
);

// export const NODE_URL = "http://127.0.0.1:4000/graphql";
export const NODE_URL = "https://beta-3.fuel.network/graphql";
export const EXPLORER_URL = "https://fuellabs.github.io/block-explorer-v2/beta-3/#";
export const FAUCET_URL = "https://faucet-beta-3.fuel.network";
export const BACKEND_URL = "https://allspark-backend.herokuapp.com/api/v1";
export const TV_DATAFEED = "https://spark-tv-datafeed.herokuapp.com/api/v1";
export const CHARTS_STORAGE = "http://62.109.15.24:8000";
// export const TV_DATAFEED = "http://localhost:5001/api/v1";

export const CONTRACT_ADDRESSES = {
  limitOrders: "0x7662a02959e3e2d681589261e95a7a4bc8ac66c6d66999a0fe01bb6c36ada7c6",
};

export interface IToken {
  logo: string;
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
}
