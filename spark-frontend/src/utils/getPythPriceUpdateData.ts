import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";

// You can find the ids of prices at https://pyth.network/developers/price-feed-ids
/*
	const priceIds = [
		TOKENS_BY_SYMBOL.ETH.priceFeed!, // ETH/USD mainnet
		TOKENS_BY_SYMBOL.USDC.priceFeed!, // USDC/USD mainnet
	];
*/
export default async function getPythPriceUpdateData(priceIds: Array<string>) {
	const connection = new EvmPriceServiceConnection("https://xc-mainnet.pyth.network");

	// In order to use Pyth prices in your protocol you need to submit the price update data to Pyth contract in your target
	// chain. `getPriceFeedsUpdateData` creates the update data which can be submitted to your contract. Then your contract should
	// call the Pyth Contract with this data.
	return connection.getPriceFeedsUpdateData(priceIds);
}
