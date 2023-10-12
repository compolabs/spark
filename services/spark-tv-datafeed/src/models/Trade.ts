import mongoose, { Document } from "mongoose";
import { TOKENS_BY_SYMBOL } from "../constants";
import BN from "../utils/BN";
import fetchIndexer from "../utils/fetchIndexer";
import { log } from "util";

export interface ITrade {
  asset0: string;
  amount0: string;
  asset1: string;
  amount1: string;
  timestamp: number;
}

export type TradeDocument = Document & ITrade;

const TradeSchema = new mongoose.Schema({
  asset0: { type: String, required: true },
  amount0: { type: String, required: true },
  asset1: { type: String, required: true },
  amount1: { type: String, required: true },
  timestamp: { type: Number, required: true },
});

export const getFirstTrade = async (market: string) => {
  const [symbol0, symbol1] = market.split("/");
  const assetId0 = { ...TOKENS_BY_SYMBOL[symbol0] }.assetId.substring(2);
  const assetId1 = { ...TOKENS_BY_SYMBOL[symbol1] }.assetId.substring(2);
  //
  const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_spark_indexer.tradeentity WHERE asset0 = '${assetId0}' AND asset1 = '${assetId1}' OR asset0 = '${assetId1}' AND asset1 = '${assetId0}' ORDER BY TIMESTAMP ASC LIMIT 1 ) t;`;
  return fetchIndexer<Array<ITrade>>(query).then((res) => res && res[0]);
};
export const getLastTrade = async (market: string) => {
  const [symbol0, symbol1] = market.split("/");
  const assetId0 = { ...TOKENS_BY_SYMBOL[symbol0] }.assetId.substring(2);
  const assetId1 = { ...TOKENS_BY_SYMBOL[symbol1] }.assetId.substring(2);

  const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_spark_indexer.tradeentity WHERE asset0 = '${assetId0}' AND asset1 = '${assetId1}' OR asset0 = '${assetId1}' AND asset1 = '${assetId0}' ORDER BY TIMESTAMP DESC LIMIT 1 ) t;`;
  return fetchIndexer<Array<ITrade>>(query).then((res) => res && res[0]);
};

export const getTrades = async (market: string, from: number, to: number) => {
  const [symbol0, symbol1] = market.split("/");
  const asset0 = { ...TOKENS_BY_SYMBOL[symbol0] };
  asset0.assetId = asset0.assetId.substring(2);
  const asset1 = { ...TOKENS_BY_SYMBOL[symbol1] };
  asset1.assetId = asset1.assetId.substring(2);
  const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_spark_indexer.tradeentity WHERE asset0 = '${asset0.assetId}' AND asset1 = '${asset1.assetId}' AND timestamp BETWEEN ${from} AND ${to} OR asset0 = '${asset1.assetId}' AND asset1 = '${asset0.assetId}' AND timestamp BETWEEN ${from} AND ${to} ) t;`;
  // const conditions = {
  //   $or: [
  //     {
  //       asset0: asset0.assetId,
  //       asset1: asset1.assetId,
  //       timestamp: { $gt: from, $lt: to },
  //     },
  //     {
  //       asset0: asset1.assetId,
  //       asset1: asset0.assetId,
  //       timestamp: { $gt: from, $lt: to },
  //     },
  //   ],
  // };
  return fetchIndexer<Array<ITrade>>(query).then((trade) =>
    (trade ?? []).map((t) => ({
      ...t,
      price:
        t.asset0 === asset0.assetId
          ? BN.formatUnits(t.amount1, asset1.decimals).div(
              BN.formatUnits(t.amount0 === "0" ? 1 : t.amount0, asset0.decimals)
            )
          : BN.formatUnits(t.amount0, asset1.decimals).div(
              BN.formatUnits(t.amount1 === "0" ? 1 : t.amount1, asset0.decimals)
            ),
    }))
  );
};

export const Trade = mongoose.model<TradeDocument>("Trade", TradeSchema);
