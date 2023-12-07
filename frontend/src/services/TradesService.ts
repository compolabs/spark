import { TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import dayjs from "dayjs";

interface ITradeResponse {
	id: number;
	owner: string;
	asset0: string;
	asset1: string;
	amount0: string;
	amount1: string;
	timestamp: number;
}

export enum TRADE_TYPE {
	BUY,
	SELL,
}

export class Trade {
	asset0: string;
	amount0: BN;
	asset1: string;
	amount1: BN;
	timestamp: number;
	type: TRADE_TYPE;

	constructor(tradeOutput: ITradeResponse, pairSymbol: string) {
		const [symbol0] = pairSymbol.split("/");
		const token0 = TOKENS_BY_SYMBOL[symbol0];

		this.type = token0.assetId === tradeOutput.asset0 ? TRADE_TYPE.SELL : TRADE_TYPE.BUY;
		this.asset0 = this.type === TRADE_TYPE.SELL ? tradeOutput.asset0 : tradeOutput.asset1;
		this.amount0 = this.type === TRADE_TYPE.SELL ? new BN(tradeOutput.amount0) : new BN(tradeOutput.amount1);
		this.asset1 = this.type === TRADE_TYPE.SELL ? tradeOutput.asset1 : tradeOutput.asset0;
		this.amount1 = this.type === TRADE_TYPE.SELL ? new BN(tradeOutput.amount1) : new BN(tradeOutput.amount0);
		this.timestamp = tradeOutput.timestamp;
	}

	get token0() {
		return TOKENS_BY_ASSET_ID[this.asset0];
	}

	get token1() {
		return TOKENS_BY_ASSET_ID[this.asset1];
	}

	get time() {
		return dayjs(this.timestamp * 1000).format("HH:mm:ss");
	}

	get priceFormatter() {
		const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
		const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
		const price = am1.div(am0);
		return price.toFormat(price.lt(0.01) ? 4 : 2);
	}

	get amountFormatter() {
		const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
		return am0.toFormat(am0.lt(0.01) ? 4 : 2);
	}

	get price() {
		const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
		const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
		return am1.div(am0);
	}

	get reversePrice() {
		const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
		const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
		return am0.div(am1);
	}

	get amount() {
		const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
		return am0.toFormat(am0.lt(0.01) ? 9 : 2);
	}

	get total() {
		const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
		return am1.toFormat(am1.lt(0.01) ? 6 : 2);
	}
}

export const getLatestTradesInPair = (symbol: string) => [];
// axios
//   .get(`${BACKEND_URL}/trades?symbol=${symbol}`)
//   .then((res) => res.data)
//   .then((arr: Array<ITradeResponse>) => arr.map((t) => new Trade(t, symbol)));
