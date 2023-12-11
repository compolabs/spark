import { ACCOUNT_BALANCE_INDEXER, IToken, TOKENS_BY_ASSET_ID } from "@src/constants";
import axios from "axios";
import BN from "@src/utils/BN";

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
	takerOpenNotional: BN;
	takerPositionSize: BN;
	tokenId: string;
	trader: string;
	symbol: string;

	constructor(positionOutput: IPositionResponse) {
		this.id = positionOutput.id;
		this.lastTwPremiumGrowthGlobal = positionOutput.last_tw_premium_growth_global;
		this.takerOpenNotional = new BN(positionOutput.taker_open_notional);
		this.takerPositionSize = new BN(positionOutput.taker_position_size);
		this.tokenId = `0x${positionOutput.token}`;
		const token = TOKENS_BY_ASSET_ID[this.tokenId];
		this.trader = positionOutput.trader;
		this.symbol = `${token.symbol}-PERP`;
	}

	get token(): IToken {
		return TOKENS_BY_ASSET_ID[this.tokenId];
	}

	get formattedAbsSize() {
		return BN.formatUnits(this.takerPositionSize.abs(), this.token.decimals).toFormat(2);
	}

	get entPrice() {
		//todo check this

		// console.log({
		// 	"this.takerOpenNotional": this.takerOpenNotional.toString(),
		// 	"this.takerPositionSize": this.takerPositionSize.toString(),
		// 	"this.token.decimals": this.token.decimals,
		// });
		const value = BN.parseUnits(this.takerOpenNotional.div(this.takerPositionSize).abs(), this.token.decimals).toString();
		return BN.formatUnits(value, 6).toFormat(2);
	}
}

export const getUserPositions = async (address: string): Promise<Position[]> => {
	const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_account_balance_indexer.positionentity WHERE trader = '${address}' ) t;`;
	const url = ACCOUNT_BALANCE_INDEXER;
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};
	const res = await axios.request({ method: "POST", url, headers, data: { query } });
	return res?.data.data[0] != null
		? res?.data.data[0].map((position: IPositionResponse): Position => new Position(position))
		: [];
};
