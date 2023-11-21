# Market Making on Spark

## Introduction

Our platform offers the opportunity for any user to engage as a Market Maker. Market Makers play a pivotal role in providing liquidity through two distinct methods:

### Just-in-Time Liquidity

Market Makers can actively participate in the Just-in-Time (JIT) auction, allowing them to supply liquidity precisely when Taker flow is initiated. This unique capability affords Market Makers the advantage of seeing retail flow five seconds before it impacts the broader market. To delve deeper into the Just-in-Time Liquidity system, please explore Just-In-Time (JIT) Auctions.

### Decentralized Orderbook

Market Makers also have the option to contribute liquidity to Spark's decentralized order book by quoting through the user interface or programmatically utilizing the SDK Documentation.

* **Providing liquidity via the UI**: Placing 'Post-Only' limit orders via Spark's user interface qualifies the order as a maker order. Such orders are not executed against the Automated Market Maker (AMM) or through the JIT. Instead, they remain in the decentralized order book until a suitable taker comes along. The 'POST' flag is activated in this case.

### Just-In-Time (JIT) Auctions

#### Introduction

The JIT Auction serves as a supplementary liquidity mechanism, empowering Market Makers (MMs) to offer 'Just-in-Time' liquidity. When a user (Taker) submits a market order, it automatically triggers an individualized Dutch Auction with specific start and end prices, along with a predefined duration. The auction framework compels MMs to compete in delivering the user's order at a price that either matches or surpasses the existing auction price. If no MM intervenes within the initial window (approximately 5 seconds), the user's order can be executed via Spark's AMM.

#### Auction Price Bands

To enhance on-chain computational efficiency for Market Makers, the default start and end prices within the auction are determined based on the oracle price and Spark AMM prices. Similar to a traditional Dutch auction, the price transition occurs from the best price for the Taker to the worst price for the Taker (and conversely, from worst to best for the Maker).

This process can be envisioned as a 'price band,' where the upper end of the band represents the maximum price the Taker is willing to pay. At the start of the JIT auction (t=0), the price at which the MM can fulfill the user's order is the furthest from the maximum price. As the auction nears its conclusion (t=5), the price approaches the maximum price.

#### The Auction Lifecycle

1. The user submits a market taker order.
2. The taker order is broadcasted to Spark's Keeper Network, which meticulously tracks all user orders.
3. The taker order initially proceeds through a Just-In-Time auction where Market Makers (MMs) have the opportunity to participate in a high-frequency Dutch auction to fulfill the user's orders.
4. JIT auction prices typically commence at the Oracle price, and Makers can submit bids to fulfill the desired position.
5. In the event that no Market Makers engage in the JIT auction, or if there is any remaining order size, the order is directed to Spark’s AMM, offering an additional source of virtual liquidity.

#### Auction Pricing

For a market buy order:

* The auction initiates at the oracle price.
* The auction concludes at the AMM's ask price.

For a market sell order:

* The auction starts at the oracle price.
* The auction ends at the AMM's bid price.

#### How It Differs from an RFQ System

Unlike an RFQ system where the Maker is responsible for submitting their own prices, the auction prices are predetermined based on Spark’s AMM curves, which are founded on Spark's inventory-adjusted spreads as discussed in Spark AMM. The price of the auction is determined on-chain and is deterministic based on the auction's timing. In contrast, in an RFQ system, the Maker has the flexibility to submit their own price at any moment. As the 5-second auction progresses, the price becomes less favorable for Takers and more advantageous for Makers. Consequently, Market Makers must strive to maintain competitiveness to provide price improvements to traders.

In an RFQ system, users receive quotes from Makers and can choose whether to accept them or not. In contrast, in a JIT auction, the prices are already pre-determined by Spark’s bid/ask curve, offering users price improvements over Spark’s AMM pricing.

For more information on the Just-in-Time Liquidity system, check out Just-In-Time (JIT) Auctions
