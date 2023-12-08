import { ACCOUNT_BALANCE_INDEXER } from "@src/constants";
import axios from "axios";

interface IPositionResponse {
	id: string;
	last_tw_premium_growth_global: string;
	taker_open_notional: string;
	taker_position_size: string;
	token: string;
	trader: string;
}

export class Position {
	id: string;
	lastTwPremiumGrowthGlobal: string;
	takerOpenNotional: string;
	takerPositionSize: string;
	token: string;
	trader: string;

	constructor(positionOutput: IPositionResponse) {
		this.id = positionOutput.id;
		this.lastTwPremiumGrowthGlobal = positionOutput.last_tw_premium_growth_global;
		this.takerOpenNotional = positionOutput.taker_open_notional;
		this.takerPositionSize = positionOutput.taker_position_size;
		this.token = positionOutput.token;
		this.trader = positionOutput.trader;
	}
}

export const getUserPositions = async (address: string): Promise<Position[]> => {
	console.log("getUserPositions");
	// const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_account_balance_indexer.positionentity WHERE trader = '${address}' ) t;`;
	const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_account_balance_indexer.positionentity) t;`;
	const url = ACCOUNT_BALANCE_INDEXER;
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};
	const res = await axios.request({ method: "POST", url, headers, data: { query } });
	return res?.data.data[0] != null
		? res.data.data[0].map((position: IPositionResponse): Position => new Position(position))
		: [];
};
