import path from "path";
import { config } from "dotenv";
import { loadVar } from "./utils/envUtils";

config({ path: path.join(__dirname, "../.env") });

export const PORT = loadVar("PORT", true);
export const INDEXER_URL = loadVar("INDEXER_URL");
export const PRIVATE_KEY = loadVar("PRIVATE_KEY");
export const CONTRACT_ADDRESS = loadVar("CONTRACT_ADDRESS");
export const NODE_URL = loadVar("NODE_URL");
