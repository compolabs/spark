# Fees

All trading fees are paid in USDC. This includes protocol fees paid to the protocol treasury, fees paid to makers (i.e., liquidity providers), and fees paid to the matching engine.

### Trading Fee

* 0.50% on sell-trades.

For example, when you open a short position or close a long position with a value of 10,000 USDC, the trading fee will be:

\= 0.005\*10,000 USDC = 10 USDC

### &#x20;Matching engine fee

* 0.05% on matched maker orders

The matching fee is an incentive for a special market participant who monitors the availability of orders to be matched to ensure that the order is executed at the earliest opportunity.&#x20;

When you place an order and some counterparty places an opposite order at the same price, someone has to match your orders to execute the trade. For example, if you open a buy order for 1 BTC at the price of 30 000 and someone creates a sell order for 1 BTC at the price of 30 000, you both pay:

\= 0.00005 \* 1 \* 30,000 = 1.5 USDC

###

### Maker fee

* 0.01% on taker trades executed at market price

For example, when you place a taker order for 1 BTC at a price 30,000 (i.e. filling some existing order), you have to pay a fee to the order creator (i.e. liquidity provider):&#x20;

\= 0.0001 \* 1 \* 30,000 = 3 USDC

\
