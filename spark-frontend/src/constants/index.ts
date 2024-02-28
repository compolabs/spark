import { Token } from "@src/entity";

import TOKEN_LOGOS from "./tokenLogos";
import tokens from "./tokens.json";

export const ROUTES = {
  ROOT: "/",
  TRADE: "/:marketId",
  FAUCET: "/faucet",
};

export const TOKENS_LIST: Array<Token> = Object.values(tokens).map(
  ({ name, symbol, decimals, assetId, priceFeed }) =>
    new Token({
      name,
      symbol,
      decimals,
      assetId,
      logo: TOKEN_LOGOS[symbol],
      priceFeed,
    }),
);
export const TOKENS_BY_SYMBOL: Record<string, Token> = TOKENS_LIST.reduce((acc, t) => ({ ...acc, [t.symbol]: t }), {});
export const TOKENS_BY_ASSET_ID: Record<string, Token> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.assetId]: t }),
  {},
);
export const NODE_URL = "https://beta-4.fuel.network/graphql";
export const EXPLORER_URL = "https://sepolia.arbiscan.io";
export const ARBITRUM_SEPOLIA_FAUCET = "https://faucet.quicknode.com/arbitrum/sepolia";
export const TV_DATAFEED = "https://spark-tv-datafeed.spark-defi.com/api/v1";
export const CHARTS_STORAGE = "https://tv-backend-v4.herokuapp.com/";

export const INDEXER_URLS = [
  "https://api.studio.thegraph.com/query/63182/arbitrum-sepolia-spot-market/version/latest",
  "https://api.studio.thegraph.com/query/63182/spark-arbitrum-spor-market/version/latest",
  "https://api.studio.thegraph.com/query/65658/spark-arbitrum-spor-market-2/version/latest",
  "https://api.studio.thegraph.com/query/65658/spark-arbitrum-spor-market-3/version/latest",
];
export const INDEXER_URL = INDEXER_URLS[0];

export const DEFAULT_DECIMALS = 9;
export const USDC_DECIMALS = 6;

type TMenuItem = {
  title: string;
  route?: string;
  link?: string;
};

export const MENU_ITEMS: Array<TMenuItem> = [
  { title: "TRADE", route: ROUTES.ROOT },
  { title: "FAUCET", route: ROUTES.FAUCET },
  { title: "DOCS", link: "https://docs.sprk.fi" },
  { title: "GITHUB", link: "https://github.com/compolabs/spark" },
];
