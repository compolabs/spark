export default [
	{
		inputs: [
			{
				internalType: "address",
				name: "_usdcAddress",
				type: "address",
			},
		],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "assetId",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint32",
				name: "decimal",
				type: "uint32",
			},
		],
		name: "MarketCreateEvent",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "bytes32",
				name: "id",
				type: "bytes32",
			},
			{
				indexed: true,
				internalType: "address",
				name: "trader",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "baseToken",
				type: "address",
			},
			{
				indexed: false,
				internalType: "int256",
				name: "baseSize",
				type: "int256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "orderPrice",
				type: "uint256",
			},
		],
		name: "OrderChangeEvent",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "baseToken",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "matcher",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "tradeAmount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "price",
				type: "uint256",
			},
		],
		name: "TradeEvent",
		type: "event",
	},
	{
		inputs: [],
		name: "USDC_ADDRESS",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "assetId",
				type: "address",
			},
			{
				internalType: "uint32",
				name: "decimal",
				type: "uint32",
			},
		],
		name: "createMarket",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		name: "markets",
		outputs: [
			{
				internalType: "address",
				name: "assetId",
				type: "address",
			},
			{
				internalType: "uint32",
				name: "decimal",
				type: "uint32",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "orderSellId",
				type: "bytes32",
			},
			{
				internalType: "bytes32",
				name: "orderBuyId",
				type: "bytes32",
			},
		],
		name: "matchOrders",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "baseToken",
				type: "address",
			},
			{
				internalType: "int256",
				name: "baseSize",
				type: "int256",
			},
			{
				internalType: "uint256",
				name: "orderPrice",
				type: "uint256",
			},
		],
		name: "openOrder",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		name: "orders",
		outputs: [
			{
				internalType: "bytes32",
				name: "id",
				type: "bytes32",
			},
			{
				internalType: "address",
				name: "trader",
				type: "address",
			},
			{
				internalType: "address",
				name: "baseToken",
				type: "address",
			},
			{
				internalType: "int256",
				name: "baseSize",
				type: "int256",
			},
			{
				internalType: "uint256",
				name: "orderPrice",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "ordersByTrader",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "bytes32",
				name: "orderId",
				type: "bytes32",
			},
		],
		name: "removeOrder",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;
