import axios from "axios";
import { CLEARING_HOUSE_INDEXER, IToken, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";

interface IPeprMarketResponse {
	asset_id: string;
	closed_price: number | null;
	decimal: number;
	id: string;
	im_ratio: number;
	mm_ratio: number;
	paused_index_price: number | null;
	paused_timestamp: number | null;
	price_feed: string;
	status: string;
}

export class PerpMarket {
	assetId: string;
	closedPice: BN;
	decimal: number;
	id: string;
	imRatio: BN;
	mmRatio: BN;
	pausedIndexPrice: BN;
	pausedTimestamp: BN;
	priceFeed: string;
	status: string;
	symbol: string;
	type: string;
	leverage: string;

	constructor(marketOutput: IPeprMarketResponse) {
		this.assetId = `0x${marketOutput.asset_id.toString()}`;
		this.closedPice = new BN(marketOutput?.closed_price ?? 0);
		this.decimal = marketOutput.decimal;
		this.id = marketOutput.id.toString();
		this.imRatio = new BN(marketOutput?.im_ratio.toString() ?? 0);
		this.mmRatio = new BN(marketOutput?.mm_ratio.toString() ?? 0);
		this.pausedIndexPrice = new BN(marketOutput?.paused_index_price ?? 0);
		this.pausedTimestamp = new BN(marketOutput?.paused_timestamp ?? 0);
		this.priceFeed = marketOutput.price_feed.toString();
		this.status = marketOutput.status.toString();
		const token = TOKENS_BY_ASSET_ID[this.assetId];
		this.symbol = `${token.symbol}-PERP`;
		this.type = "perp";
		this.leverage = new BN(1).div(BN.formatUnits(this.imRatio, 6)).toNumber().toFixed(0);
	}

	get token0(): IToken {
		return TOKENS_BY_ASSET_ID[this.assetId];
	}

	get token1(): IToken {
		return TOKENS_BY_SYMBOL.USDC;
	}
}

export const getPerpMarkets = async (): Promise<PerpMarket[]> => {
	const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_clearing_house_indexer.marketentity ) t;`;
	const url = CLEARING_HOUSE_INDEXER;
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};
	const res = await axios.request({ method: "POST", url, headers, data: { query } });
	return res?.data.data[0] != null
		? res.data.data[0].map((market: IPeprMarketResponse): PerpMarket => new PerpMarket(market))
		: [];
};
