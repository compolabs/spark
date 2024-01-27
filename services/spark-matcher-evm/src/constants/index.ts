import tokens from "./tokens.json";

export const TOKENS_LIST: Array<IToken> = Object.values(tokens).map((t) => ({
  ...t,
}));
export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.symbol]: t }),
  {}
);
export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.assetId]: t }),
  {}
);

export interface IToken {
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
}
