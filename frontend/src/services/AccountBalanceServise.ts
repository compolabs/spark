import { ACCOUNT_BALANCE_INDEXER, IToken, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import makeIndexerRequest from "@src/utils/makeIndexerRequest";

interface IPositionResponse {
	id: string;
	last_tw_premium_growth_global: string;
	taker_open_notional: string;
	taker_position_size: string;
	token: string;
	trader: string;
}

export class PerpPosition {
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
		const value = BN.parseUnits(this.takerOpenNotional.div(this.takerPositionSize).abs(), this.token.decimals).toString();
		return BN.formatUnits(value, 6).toFormat(2);
	}
}

export const getUserPositions = async (address: string): Promise<PerpPosition[]> => {
	const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_account_balance_indexer.positionentity WHERE trader = '${address}' AND taker_position_size != '0' ) t;`;
	const res = await makeIndexerRequest(query, ACCOUNT_BALANCE_INDEXER);
	return res?.data.data[0] != null
		? res?.data.data[0].map((position: IPositionResponse): PerpPosition => new PerpPosition(position))
		: [];
};
export const getOpenInterest = async (tokenAddress: string): Promise<BN> => {
	//abs(accountBalance(i, base_asset).taker_open_notional)
	//fixme add calc to sql side
	const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_account_balance_indexer.positionentity WHERE token = '${tokenAddress.slice(
		2,
	)}' ) t;`;
	const res = await makeIndexerRequest(query, ACCOUNT_BALANCE_INDEXER);
	const arr = res?.data.data[0] != null ? (res?.data.data[0] as IPositionResponse[]) : [];
	const sum = arr.reduce((acc, v) => acc.plus(new BN(v.taker_open_notional).abs()), BN.ZERO);
	//todo уточнить какой decimals
	return BN.formatUnits(sum, 8);
};
