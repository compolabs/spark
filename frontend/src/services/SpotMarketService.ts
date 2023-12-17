import { SPOT_INDEXER, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import dayjs from "dayjs";
import makeIndexerRequest from "@src/utils/makeIndexerRequest";

interface ISpotOrderResponse {
	id: string;
	order_id: number;
	owner: string;
	asset0: string;
	amount0: string;
	asset1: string;
	amount1: string;
	status: string;
	fulfilled0: string;
	fulfilled1: string;
	timestamp: number;
	matcher_fee: string;
	matcher_fee_used: string;
	type: "SELL" | "BUY";
	price: number;
	market: string;
}

export class SpotOrder {
	asset0: string;
	amount0: BN;
	asset1: string;
	amount1: BN;
	status: string;
	fulfilled0: BN;
	fulfilled1: BN;
	owner: string;
	id: string;
	orderId: number;
	timestamp: number;
	matcher_fee: BN;
	matcher_fee_used: BN;
	type: "SELL" | "BUY";
	price: number;
	market: string;

	constructor(orderOutput: ISpotOrderResponse) {
		this.id = orderOutput.id.toString();
		this.orderId = orderOutput.order_id;
		this.asset0 = orderOutput.asset0;
		this.amount0 = new BN(orderOutput.amount0.toString());
		this.asset1 = orderOutput.asset1;
		this.amount1 = new BN(orderOutput.amount1.toString());
		this.status = orderOutput.status;
		this.fulfilled0 = new BN(orderOutput.fulfilled0.toString());
		this.fulfilled1 = new BN(orderOutput.fulfilled1.toString());
		this.owner = orderOutput.owner;
		this.timestamp = orderOutput.timestamp;
		this.matcher_fee = new BN(orderOutput.matcher_fee.toString());
		this.matcher_fee_used = new BN(orderOutput.matcher_fee_used.toString());
		this.type = orderOutput.type;
		this.price = orderOutput.price;
		this.market = orderOutput.market;
	}

	get token0() {
		return TOKENS_BY_ASSET_ID[this.asset0];
	}

	get token1() {
		return TOKENS_BY_ASSET_ID[this.asset1];
	}

	get time() {
		return dayjs(+this.timestamp * 1000).format("DD-MMM HH:mm:ss");
	}

	get fullFillPercent() {
		return this.fulfilled0.eq(0) ? 0 : +this.fulfilled0.times(100).div(this.amount0).toFormat(2);
	}

	get priceFormatter() {
		const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
		const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
		const price = am1.div(am0);
		return `${price.toFormat(price.lt(0.01) ? 4 : 2)} ${this.token1.symbol}`;
	}

	// get price() {
	//   const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
	//   const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
	//   return am1.div(am0);
	// }

	// get reversePrice() {
	//   const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
	//   const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
	//   return am0.div(am1);
	// }

	get amountStr() {
		const am0 = BN.formatUnits(this.amount0, this.token0.decimals);
		return am0.toFormat(am0.lt(0.01) ? 9 : 2);
	}

	get amountLeft() {
		return this.amount0.minus(this.fulfilled0);
	}

	get amountLeftStr() {
		const value = BN.formatUnits(this.amountLeft, this.token0.decimals);
		return value.toFormat(value.lt(0.01) ? 6 : 2);
	}

	get total() {
		const am1 = BN.formatUnits(this.amount1, this.token1.decimals);
		return am1.toFormat(am1.lt(0.01) ? 6 : 2);
	}

	get totalLeft() {
		return this.amount1.minus(this.fulfilled1);
	}

	get totalLeftStr() {
		const value = BN.formatUnits(this.totalLeft, this.token1.decimals);
		return value.toFormat(value.lt(0.01) ? 6 : 2);
	}
}

export const getSpotOrderbook = async (
	owner: string,
	market: string,
): Promise<{
	mySpotOrders: Array<SpotOrder>;
	orderbook: { buy: Array<SpotOrder>; sell: Array<SpotOrder> };
}> => {
	const [symbol0, symbol1] = market.split("/");
	let assetId0 = TOKENS_BY_SYMBOL[symbol0].assetId.substring(2);
	let assetId1 = TOKENS_BY_SYMBOL[symbol1].assetId.substring(2);
	const sellQuery = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_spot_market_indexer.orderentity WHERE status = 'Active' AND asset0 = '${assetId0}' AND asset1 = '${assetId1}') t;`;
	const buyQuery = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_spot_market_indexer.orderentity WHERE status = 'Active' AND asset0 = '${assetId1}' AND asset1 = '${assetId0}') t;`;
	owner = owner.substring(2);
	const ownerQuery = `SELECT json_agg(t) FROM (SELECT * FROM composabilitylabs_spot_market_indexer.orderentity WHERE owner = '${owner}') t;`;

	const res = await Promise.all([
		makeIndexerRequest(buyQuery, SPOT_INDEXER),
		makeIndexerRequest(sellQuery, SPOT_INDEXER),
		owner.length === 0 ? null : makeIndexerRequest(ownerQuery, SPOT_INDEXER),
	]);
	const [buy, sell, mySpotOrders] = res.map((res) =>
		res?.data.data[0] != null
			? res.data.data[0].map(
					(order: ISpotOrderResponse): SpotOrder =>
						new SpotOrder({
							...order,
							market,
							asset0: `0x${order.asset0}`,
							asset1: `0x${order.asset1}`,
							type: assetId0 === order.asset0 ? "SELL" : "BUY",
							price:
								assetId0 === order.asset0
									? BN.formatUnits(order.amount1, TOKENS_BY_SYMBOL.USDC.decimals)
											.div(BN.formatUnits(order.amount0, TOKENS_BY_SYMBOL.UNI.decimals))
											.toNumber()
									: BN.formatUnits(order.amount0, TOKENS_BY_SYMBOL.USDC.decimals)
											.div(BN.formatUnits(order.amount1, TOKENS_BY_SYMBOL.UNI.decimals))
											.toNumber(),
						}),
			  )
			: [],
	);
	// console.log({ myOrders, orderbook: { sell, buy } });
	return {
		mySpotOrders,
		orderbook: {
			sell: sell.filter((order: SpotOrder) => order.amountLeft.gt(0) && order.totalLeft.gt(0)),
			buy: buy.filter((order: SpotOrder) => order.amountLeft.gt(0) && order.totalLeft.gt(0)),
		},
	};
};

interface ISpotTradeResponse {
	address: string; //much be owner? todo check
	amount0: number;
	amount1: number;
	asset0: string;
	asset1: string;
	id: string;
	timestamp: number;
}

export enum TRADE_TYPE {
	BUY,
	SELL,
}

export class SpotTrade {
	address: string;
	amount0: BN;
	amount1: BN;
	asset0: string;
	asset1: string;
	id: string;
	timestamp: number;

	constructor(tradeOutput: ISpotTradeResponse) {
		this.address = tradeOutput.id.toString();
		this.amount0 = new BN(tradeOutput.amount0);
		this.amount1 = new BN(tradeOutput.amount1);
		this.asset0 = tradeOutput.asset0;
		this.asset1 = tradeOutput.asset1;
		this.id = tradeOutput.id;
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
