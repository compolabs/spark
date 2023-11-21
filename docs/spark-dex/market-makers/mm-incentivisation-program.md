# MM Incentivisation program

### Introduction

The Maker Incentive Program is designed to stimulate market makers to provide liquidity on Spark. Market makers who qualify for the program and choose to participate will have the opportunity to share in up to 5% of the protocol fee on a weekly basis.

### Who Can Join?

The program is open to anyone with the technical capability to engage in programmatic market making on the Spark platform. To become a part of the program, interested market makers are invited to apply. Eligibility will be determined during the application process, and for inquiries or applications, please reach out on Telegram to @Eatwoods.

### Program Duration

The Maker Incentive Program operates on a weekly schedule, commencing each Monday at 00:00 UTC and concluding on the following Sunday at 23:59 UTC, collectively referred to as the "Program Period." In the event that the program is paused for any specific week, Spark will notify participating market makers accordingly.

### Rewards

The rewards offered under this program are divided into two categories:

* **Volume Reward:** Equal to 2.5% in USDC
* **Score Reward:** Also amounting to 2.5% in USDC

### Reward Calculation

#### Volume Reward

Participating market makers will receive their pro-rata share of the 2.5% fee allocation based on their relative maker volume across all markets. The calculation is as follows:

<figure><img src="../../.gitbook/assets/image (2).png" alt=""><figcaption></figcaption></figure>

All market makers who participate in the program will receive their pro-rata allocation of 2.5% of fees based on their relative liquidity score within each market, as determined by the following formula:

<figure><img src="../../.gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

This formula can be further deconstructed into two key components:

**Market Maker (MM) Score Over a Period:** This score reflects the market maker's performance within a specific market, considering data from n snapshots collected over the designated period.

<figure><img src="../../.gitbook/assets/image (3).png" alt=""><figcaption></figcaption></figure>

**Market Maker (MM) Order Score per Snapshot:** The MM Order Score is determined by computing the weighted sum of the market maker's ask orders at different price levels. This calculation considers the quantity (Q) of the lesser of available liquidity within that bid and ask bracket.

The MM Order Score calculates the weighted sum of the size of the market maker's ask orders at various price levels. It takes into account the quantity (Q) of lower of liquidity available at that bid, ask bracket.

<figure><img src="../../.gitbook/assets/image (4).png" alt=""><figcaption></figcaption></figure>

* **Liquidity of an Individual Market Maker Within a Bid or Ask Bracket (Lbracket, side):** This metric quantifies the liquidity provided by a specific market maker within a given bid or ask bracket.
* **Total Liquidity Within a Bid or Ask Bracket for All Market Makers (Qbracket):** This encompasses the collective liquidity available within a bid or ask bracket, considering contributions from all market makers.
* Additionally, the score calculation factors in the **largest value among an individual bracket's bid liquidity, ask liquidity, or the equivalent of $5,000 in liquidity**.

This scoring system aims to encourage market makers to place orders at the top of the order book, with orders situated within 1 basis point (bp) of the best bid/ask receiving a fourfold weighting.

| Bracket | Distance from best order on side |
| ------- | -------------------------------- |
| A       | within 0 - 1 bps                 |
| B       | within 1 - 5 bps                 |
| C       | within 5 - 10 bps                |
| D       | within 10 - 20 bps               |
| E       | within 20 - 50 bps               |
| F       | within 50 - 100 bps              |

| Term | Distance from best order on side         |
| ---- | ---------------------------------------- |
| Qa   | max(L\_{A,bid}, L\_{A,ask}, $5000/price) |
| Qb   | max(L\_{B,bid}, L\_{B,ask}, $5000/price) |
| Qc   | max(L\_{C,bid}, L\_{C,ask}, $5000/price) |
| Qd   | max(L\_{D,bid}, L\_{D,ask}, $5000/price) |
| Qe   | max(L\_{E,bid}, L\_{E,ask}, $5000/price) |
| Qf   | max(L\_{F,bid}, L\_{F,ask}, $5000/price) |

Note: If a single market maker offers the best bid and ask with $5,000 worth of liquidity, this would correspond to a score of 400. Conversely, if another market maker contributes the remaining liquidity, resulting in $5,000 multiplied by 5, totaling $25,000 across all other brackets, their score would be calculated as 365. This calculation is based on the formula (2 + 0.75 + 0.4 + 0.3 + 0.2) multiplied by 100.

The scoring mechanism provides a strong incentive for market makers to place orders at the top of the order book, with orders positioned within 1 basis point (bp) of the best bid/ask receiving a fourfold weighting.

| mkt       | ScoreRewardPool |
| --------- | --------------- |
| FUEL-USD  | 500             |
| BTC-USD   | 500             |
| ETH-USD   | 500             |
| MATIC-USD | 500             |
| DOGE-USD  | 500             |

### Notes

* Please note that this program represents an early iteration of an on-chain liquidity provisioning initiative, which will eventually be overseen by SparkDAO. As we progress towards the implementation of SparkDAO, rewards and program details are subject to change.
* Additional Terms: The program strictly prohibits any form of wash trading or self-matching. If any instances of wash trading or self-matching are detected with the intent of manipulating market share, the incentives for that particular month will be forfeited. Such determinations will be made at the sole discretion of Spark Protocol.
* Market makers will have access to performance tracking tools at \[Spark Maker Performance]\(insert link).

### Payment Options

Qualified Market Makers will receive their payments in USDC. Payouts will be processed in the week following the conclusion of each Program Period.
