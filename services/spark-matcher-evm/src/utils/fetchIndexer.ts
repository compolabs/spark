import { INDEXER_URL } from "../config";
import axios from "axios";

export default async function fetchIndexer<T>(query: string) {
  const config = {
    method: "POST",
    url: INDEXER_URL,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    data: { query },
  };
  const result: T = await axios
    .request(config)
    .then((result) => result.data.data[0])
    .catch((e) => console.error(`❌ Indexer call: ${e.toString()}\nQuery: ${config.data.query}`));
  return result;
}
