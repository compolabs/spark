import { RequestHandler } from "express";
import UDF, { symbols } from "../services/udf";
const udf = new UDF();

export const getConfig: RequestHandler<null> = async (req, res, next) => {
  res.send(await udf.config());
};

export const getTime: RequestHandler<null> = async (req, res) => {
  const time = Math.floor(Date.now() / 1000); // In seconds
  res.set("Content-Type", "text/plain").send(time.toString());
};

export const getSymbols: RequestHandler<null> = async (req, res) => {
  res.send(await udf.symbol(req.query.symbol as any));
};

export const getAllSymbols: RequestHandler<null> = async (req, res) => {
  res.send(symbols.map(({ symbol }) => symbol));
};

export const getHistory: RequestHandler<null> = async (req, res) => {
  //@ts-ignore
  res.send(await udf.history(req.query.symbol, req.query.from, req.query.to, req.query.resolution));
};
