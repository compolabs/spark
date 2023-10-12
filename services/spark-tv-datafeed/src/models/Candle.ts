import mongoose, { Document } from "mongoose";

export interface ICandle {
  t: number;
  o: number;
  c: number;
  h: number;
  l: number;
  v: number;
  resolution: string;
}

export type CandleDocument = Document & ICandle;

const CandleSchema = new mongoose.Schema({
  t: { type: Number, required: true },
  o: { type: Number, required: true },
  c: { type: Number, required: true },
  h: { type: Number, required: true },
  l: { type: Number, required: true },
  v: { type: Number, required: true },
  resolution: { type: String, required: true },
});

export const Candle = mongoose.model<CandleDocument>("Candle", CandleSchema);
