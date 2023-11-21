# 🌊 Liquidity provision

## Liquidity Provision Incentive Program

### Spark Liquidity Provision

In a bid to stimulate market liquidity, Spark has initiated a program wherein $SPARK tokens are distributed to liquidity providers based on a formula designed to reward their active participation in the markets. The formula takes into consideration three crucial parameters:

1. Two-sided depth (Bid & Ask)
2. Spread
3. Uptime on Spark

Participation in this incentive program is open to any address, provided that they meet the minimum maker volume threshold of 0.25% of the total maker volume during the preceding period. The distribution of $SPARK tokens is executed on a 30-day cycle spanning over a duration of 6 years. Each epoch involves the allocation of 2,777,779 $SPARK tokens, with half of the distributed tokens subject to a 6-month vesting period.

Liquidity provider performance is meticulously monitored and computed on a minute-by-minute basis, employing randomized sampling. These metrics are then aggregated to generate a Q SCORE for each market. With minute-by-minute sampling, every period encompasses 30 days \* 24 hours \* 60 minutes of data points, amounting to a total of 43,200 data points per period.

Liquidity providers earn monthly rewards based on their relative QFINAL share per 30 days.

Qfinal = (QBTC + QETH + QnonBTC/ETH)

Where:

* QBTC = N = 143,200 \* QMIN(N) = BidDepth1 \* Spreads1 + BidDepth2 \* Spreads2 + ... + AskDepth1 \* Spreads1 + AskDepth2 \* Spreads2^0.15
  * N = 143,200 \* Count(QMIN(N) > 0)^5 \* Maker Volume^0.85
* QETH = N = 143,200 \* QMIN(N) = BidDepth1 \* Spreads1 + BidDepth2 \* Spreads2 + ... + AskDepth1 \* Spreads1 + AskDepth2 \* Spreads2^0.15
  * N = 143,200 \* Count(QMIN(N) > 0)^5 \* Maker Volume^0.85
* Qnon BTC/ETH = N = 143,200 \* QMIN(N) = BidDepth1 \* Spreads1 + BidDepth2 \* Spreads2 + ... + AskDepth1 \* Spreads1 + AskDepth2 \* Spreads2^0.35
  * N = 143,200 \* Count(QMIN(N) > 0)^5 \* Maker Volume^0.65

Step-by-step calculations:

1. QBid is calculated every minute using random sampling.
   * QBid = BidDepth1 \* Spreads1 + BidDepth2 \* Spreads2 + BidDepth3 \* Spreads3... for each bid order with BidDepth > MinDepth and with Spread < MaxSpread (Mid-Market)
2. QAsk is calculated every minute using random sampling.
   * QAsk = AskDepth1 \* Spreads1 + AskDepth2 \* Spreads2 + AskDepth3 \* Spreads3... for each ask order with BidDepth > MinDepth and with Spread < MaxSpread (Mid-Market)
3. Rewards two-sided liquidity by taking the minimum of QBid and QAsk, calculated every minute.
   * QMIN = MIN(QBid, QAsk)
4. QPeriod is the sum of all QMIN in a given period.
   * QPeriod = N = 143,200 \* Σ(QMIN)N
5. UptimePeriod is the time in a period that a given market maker was live and quoting on both the bid and ask sides.
   * UptimePeriod = N = 143,200 \* Count(QMIN(N) > 0)
6. QFinal normalizes QPeriod to account for uptime.
   * QFinal = QPeriod / (UptimePeriod)^5

Rewards for Liquidity Providers

Each market will have its own rewards pool that will be weighted differently. The set of weights applied to each market in the beginning can be as described below. Eventually, the community should decide the weights:

* BTC/USD: 10%
* ETH/USD: 10%
* Other pairs: (100% - BTC/USD allocation - ETH/USD allocation) / (Count of samples for this market in this period / Total count of non-BTC and non-ETH samples in this period)

When can one withdraw and transfer claimed $SPARK Liquidity Provider Rewards?

$SPARK tokens rewarded via the Liquidity Provider Rewards will become claimable and transferable once the initial transfer restriction period is lifted. Starting in Period 2, $Spark tokens rewarded via the Liquidity Provider Rewards will become claimable 7 days (Waiting Period) after the end of each period.

Two-Sided Depth

A two-sided liquidity provider is a firm or individual who actively quotes two-sided markets on the Spark Orderbook, providing bids and asks for a given market. They provide liquidity to the protocol overall. Liquidity providers are assessed on their ability to provide both bids and asks on a given market. Liquidity providers who only quote on one side (either just bids or asks) are excluded from receiving rewards due to the min() function.

Mid-Market Spread

The difference between the bid and the ask, known as the spread, is the principal transaction cost of trading (outside commissions), and it is collected by the liquidity provider by processing orders at the bid and ask prices. The spread measures the cost of transacting immediately for a user. The mid-market spread specifically takes the midpoint of the market.

Uptime

Liquidity provider uptime is critical for markets, especially in periods of high volatility. By applying an exponent of 5, the rewards are skewed towards liquidity providers who maintain 2-sided liquidity constantly. In other words, a liquidity provider who provides uptime 99% of the time is exponentially more valuable than a liquidity provider who provides 90% uptime. Uptime is defined as the percentage of time orders are in a given market providing liquidity on a minute-by-minute basis (with randomized sampling). Uptime excludes periods of time when outages exist on the Spark Orderbook itself.

**Maker & Taker Fees**

| Level | From (30D Volume in $) | To (30D Volume in $) | Maker % | Taker % |
| ----- | ---------------------- | -------------------- | ------- | ------- |
| Free  | 0                      | 100'000              | 0       | 0       |
| 1     | 100'000                | 1'000'000            | 0.02    | 0.05    |
| 2     | 1'000'000              | 5'000'000            | 0.015   | 0.04    |
| 3     | 5'000'000              | 10'000'000           | 0.01    | 0.035   |
| 4     | 10'000'000             | 50'000'000           | 0.005   | 0.03    |
| 5     | 50'000'000             | 200'000'000          | 0       | 0.025   |
| 6     | +200'000'000           | -                    | 0       | 0.02    |

Spark Tools and Ecosystem

The Spark ecosystem is made up of various participants, including:

Contributors and Delegates: These are individuals and organizations that actively contribute to the Spark DAO and may include ambassadors, Spark stakeholders, and university clubs that operate like DAOs, such as FranklinDAO.

Market Makers: Market-making firms like GSR and Wintermute play a significant role in providing liquidity to the Spark ecosystem.

Media and Education: Entities like Spark Academy, various media outlets, and Key Opinion Leaders (KOLs) from the community who organize trading competitions contribute to educating and informing the community.

Infrastructure: Infrastructure providers encompass wallet services, RPC (Remote Procedure Call) providers, oracles, custodians, libraries, stablecoin providers like Circle, and auditors. They form the backbone of the technical and operational aspects of the Spark ecosystem.

Research and Analytics: Organizations like Xenophon Labs, Chaos Labs, Dune, along with community researchers, Carma, Wonder, and Clarity, are instrumental in conducting research and providing analytics that enhance the ecosystem's understanding and performance.

Partners: Partnerships are established with validators, dashboard providers, and projects that issue their own coins, creating a network of collaborative efforts within the Spark ecosystem.
