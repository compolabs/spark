import axios from "axios";

export const INDEXER_URLS = [
  "https://api.studio.thegraph.com/query/65658/spark-arbitrum-spor-market-3/version/latest",
  "https://api.studio.thegraph.com/query/65658/spark-arbitrum-spor-market-2/version/latest",
  "https://api.studio.thegraph.com/query/63182/spark-arbitrum-spor-market/version/latest",
  "https://api.studio.thegraph.com/query/63182/arbitrum-sepolia-spot-market/version/latest",
];

export const fetchIndexer = async (query: string) => {
  for (const i in INDEXER_URLS) {
    const indexer = INDEXER_URLS[i];
    try {
      return await axios.post(indexer, { query });
    } catch (error: any) {
      console.error(`❌ Indexer call: ${error.toString()}\n  Indexer: ${indexer}\n`);
      /*eslint-disable-next-line */
    }
  }
  return await axios.post(INDEXER_URLS[0], { query });
};
