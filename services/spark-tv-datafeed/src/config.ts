import path from "path";
import { config } from "dotenv";
import { loadVar } from "./utils";

config({ path: path.join(__dirname, "../.env") });

export const PORT = loadVar("PORT", true);
export const MONGO_URL = loadVar("MONGO_URL");
export const INDEXER_URL = loadVar("INDEXER_URL", true);
