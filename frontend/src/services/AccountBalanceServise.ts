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
		const value = BN.parseUnits(this.takerOpenNotional.div(this.takerPositionSize).abs(), this.token.decimals).toString();
		return BN.formatUnits(value, 6).toFormat(2);
	}
}

export const getUserPositions = async (address: string): Promise<Position[]> => {
	// const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_account_balance_indexer.positionentity WHERE trader = '${address}' ) t;`;
	const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_account_balance_indexer.positionentity) t;`;
	const url = ACCOUNT_BALANCE_INDEXER;
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};
	const res = await axios.request({ method: "POST", url, headers, data: { query } });
	console.log(res?.data.data[0]);
	return res?.data.data[0] != null
		? Array.from({ length: 10 })
				.map(() => positionsConfig)
				.map((position: IPositionResponse): Position => new Position(position))
		: [];
};

const positionsConfig = {
	id: "5aecb0ae45462b0957b72c129593580d8e9974554cbd0fbfee1c5e15abbc82db",
	last_tw_premium_growth_global: "5485902839146",
	object:
		"\\x060000000000000010000000014000000000000000356165636230616534353436326230393537623732633132393539333538306438653939373435353463626430666266656531633565313561626263383264620000000001200000000000000047010c8ecfeaa888954d7a536131fa962060e28552f3353c06954afdc558410e0200000001200000000000000026829bff466f19001665597228458372fd57cbd325864c7118b5eb5441c421571300000001010000000000000030130000000101000000000000003013000000010a0000000000000031363734313731313638",
	taker_open_notional: "64870968921",
	taker_position_size: "-150000000",
	token: "26829bff466f19001665597228458372fd57cbd325864c7118b5eb5441c42157",
	trader: "47010c8ecfeaa888954d7a536131fa962060e28552f3353c06954afdc558410e",
};
