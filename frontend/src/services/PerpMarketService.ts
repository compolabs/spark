import { ACCOUNT_BALANCE_INDEXER, IToken, PERP_MARKET_INDEXER, TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import axios from "axios";

interface IPerpPriceResponse {
	id: string;
	mark_price: number;
	market_price: number;
	token: string;
}

interface IPerpOrderResponse {
	active: boolean;
	base_size: string;
	base_token: string;
	id: string;
	order_price: number;
	trader: string;
}

interface IPerpTradeResponse {
	id: string;
	matcher: string;
	price: number;
	token: string;
	trade_amount: number;
	trade_value: number;
}

export class PerpMarketPrice {
	symbol: string;
	id: string;
	markPrice: BN;
	marketPrice: BN;
	tokenId: string;

	constructor(priceOutput: IPerpPriceResponse) {
		this.id = priceOutput.id;
		this.tokenId = `0x${priceOutput.token}`;
		this.symbol = `${this.tokenId}-PERP`;
		this.id = priceOutput.id;
		this.markPrice = new BN(priceOutput.mark_price);
		this.marketPrice = new BN(priceOutput.market_price);
	}

	get token(): IToken {
		return TOKENS_BY_ASSET_ID[this.tokenId];
	}
}

export const getPerpMarketPrices = async (): Promise<Record<string, PerpMarketPrice>> => {
	const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_perp_market_indexer.priceentity) t;`;
	const url = PERP_MARKET_INDEXER;
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};
	const res = await axios.request({ method: "POST", url, headers, data: { query } });

	return res?.data.data[0] != null
		? res.data.data[0]
				.map((price: IPerpPriceResponse): PerpMarketPrice => new PerpMarketPrice(price))
				.reduce(
					(acc: PerpMarketPrice[], val: PerpMarketPrice) => ({
						...acc,
						[val.tokenId]: val,
					}),
					{} as Record<string, PerpMarketPrice>,
				)
		: {};
};

export class PerpTrade {
	id: string;
	matcher: string;
	price: BN;
	tokenId: string;
	trade_amount: BN;
	trade_value: BN;
	marketSymbol: string;

	constructor(tradeOutput: IPerpTradeResponse) {
		this.id = tradeOutput.id;
		this.matcher = tradeOutput.matcher;
		this.price = new BN(tradeOutput.price.toString());
		this.tokenId = `0x${tradeOutput.token}`;
		this.trade_amount = new BN(tradeOutput.trade_amount.toString());
		this.trade_value = new BN(tradeOutput.trade_value.toString());
		const token = TOKENS_BY_ASSET_ID[this.tokenId];
		this.marketSymbol = `${token.symbol}-PERP`;
	}

	get token(): IToken {
		return TOKENS_BY_ASSET_ID[this.tokenId];
	}
}

export const getPerpTrades = async (): Promise<PerpTrade[]> => {
	//todo get latest for trades
	const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_perp_market_indexer.tradeentity) t;`;
	const url = PERP_MARKET_INDEXER;
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};
	const res = await axios.request({ method: "POST", url, headers, data: { query } });
	return res?.data.data[0] != null
		? res.data.data[0].map((trade: IPerpTradeResponse): PerpTrade => new PerpTrade(trade))
		: [];
};

////// perp order
export class PerpOrder {
	active: boolean;
	baseSize: BN;
	baseToken: string;
	id: string;
	orderPrice: BN;
	trader: string;
	marketSymbol: string;

	constructor(orderOutput: IPerpOrderResponse) {
		this.active = orderOutput.active;
		this.baseSize = new BN(orderOutput.base_size);
		this.baseToken = `0x${orderOutput.base_token}`;
		this.id = orderOutput.id;
		this.orderPrice = new BN(orderOutput.order_price);
		this.trader = orderOutput.trader;
		const token = TOKENS_BY_ASSET_ID[this.baseToken];
		this.marketSymbol = `${token.symbol}-PERP`;
	}

	get token(): IToken {
		return TOKENS_BY_ASSET_ID[this.baseToken];
	}

	get formattedSize(): string {
		return BN.formatUnits(this.baseSize, this.token.decimals).toFormat(4);
	}
}

export const getUserPerpOrders = async (address: string): Promise<PerpOrder[]> => {
	const query = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_perp_market_indexer.orderentity WHERE trader = '${address}' AND active = true  ) t;`;
	const url = ACCOUNT_BALANCE_INDEXER;
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};
	const res = await axios.request({ method: "POST", url, headers, data: { query } });
	return res?.data.data[0] != null
		? res?.data.data[0].map((order: IPerpOrderResponse): PerpOrder => new PerpOrder(order))
		: [];
};
