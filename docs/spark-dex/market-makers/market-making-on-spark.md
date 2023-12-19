# Market Making on Spark

**Market Maker Rewards Program:**

**1. Maker Rebates:**

* **Description:** By placing limit orders and contributing liquidity to the order book, you qualify for maker rebates.
* **Rebate Calculation:** 0.01%-0.02% of the maker trading volume.
* **Reward:** Earned in Spark Points, convertible to Fuel tokens at a rate of 30 Spark Point to 1 Fuel token.

**2. Liquidity Mining Program:**

* **Description:** Participate in our liquidity mining program to receive additional rewards based on your liquidity provision.
* **Reward Calculation:** Earn Spark Points using the formula: LP\_Spark\_Points = Liquidity Provided \* Days \* LP\_Weight
* **Conversion Rate:** 30 Spark Point = 1 Fuel token.
* **Example:** If you provide $1,000 in liquidity for 30 days with an LP\_Weight of 0.001, you earn 30 Spark Points, equivalent to 1 Fuel tokens.

**3. VIP Market Maker Program:**

* **Description:** For top-tier market makers contributing significant liquidity, unlock exclusive benefits through our VIP program.
* **VIP Benefits:**
  * Personalized fee structures.
  * Priority access to new features and trading pairs.
  * Dedicated support from the sprk.fi team.
  * Enhanced Fuel token rewards for increased engagement.

**4. Volume-Based Fee Discounts:**

* **Description:** The more you trade, the greater your fee discounts. Maximize your profitability through our tiered fee structure.
*   **Volume Tiers and Fee Discounts:**

    | Volume Tier | Trading Volume (USDC)                     | Fee Discount | Fuel Token Bonus |
    | ----------- | ----------------------------------------- | ------------ | ---------------- |
    | 1           | Up to 100,000 USDC within 30 days         | Standard Fee | -                |
    | 2           | 100,001 - 500,000 USDC within 30 days     | 25%          | 100 Fuel tokens  |
    | 3           | 500,001 - 1,000,000 USDC within 30 days   | 30%          | 250 Fuel tokens  |
    | 4           | 1,000,001 - 5,000,000 USDC within 30 days | 40%          | 500 Fuel tokens  |

**Standard Fees:**

| Fee Type     | Maker Fee | Taker Fee                          |
| ------------ | --------- | ---------------------------------- |
| Stables      | 0%        | 1 bps for stables and Fuel tokens  |
| Core Markets | 0%        | 2 bps for BTC and ETH,             |
| Alt Markets  | 0%        | 3 bps for all other tokens         |

**VIP Market Maker Fees:**

| Fee Type     | Spot     | Perp     |
| ------------ | -------- | -------- |
| Stables      | 0,5 bps  | 0,25 bps |
| Core Markets | 0,75 bps | 0,5 bps  |
| Alt Markets  | 0,75 bps | 0,75 bps |

**Rebate Calculation Formula:** $$Rebate=0.2%×Trading VolumeRebate=0.05%×Trading Volume$$

Rebate=0.02%×Trading VolumeRebate=0.05%×Trading Volume

#### 1. Managing Buy/Sell Pressure

Market makers must balance their buy and sell orders to manage inventory risk and create an equilibrium in the market. The formula for placing orders can be influenced by several factors:

* **Order Size**: Based on the market maker's risk tolerance and capital.
* **Price Levels**: Determined by the mid-market price, adjusted for desired spread.

**Formula:**

* **Bid Price** = Mid-Market Price - (Spread \* Buy Pressure Factor)
* **Ask Price** = Mid-Market Price + (Spread \* Sell Pressure Factor)

Where Buy Pressure Factor and Sell Pressure Factor are coefficients that determine how aggressively the market maker wants to buy or sell. These factors can be adjusted based on market conditions, inventory levels, and volatility.

The minimum depth and maximum spreads per market are as follows:

**Depth:**

* $25K for stables.
* $5K for core markets (BTC & ETH).
* $2.5K for alt markets (non-BTC & non-ETH).

**Spreads:**

* 10 bps for stable.
* 30 bps for core markets (BTC & ETH).
* 50 bps for alt markets (non-BTC & non-ETH).

#### 2. Liquidity Provision

The goal here is to ensure there's enough depth in the order book. The market maker places several buy and sell limit orders at different price levels.

**Formula:**

* **Multiple Bid Prices**: \[Bid Price - (Depth \* n)] for n layers of depth
* **Multiple Ask Prices**: \[Ask Price + (Depth \* n)] for n layers of depth

Where `Depth` is the price interval between different layers, and `n` is the number of layers.

#### 3. Funding Rate Earnings (Perpetual Markets)

In perpetual markets, the funding rate is a mechanism to anchor the perpetual contract price to the spot price. Market makers can earn from the funding rate by taking positions opposite to the majority of traders.

**Formula:**

* **Funding Rate Earnings** = Position Size \* Funding Rate

Where `Position Size` is the size of the open position in the perpetual market, and `Funding Rate` is the rate paid or received for holding the position.

**Volume SLA (USDC) within 30 days:**

* Tier 1: Up to 100,000 USDC&#x20;
* Tier 2: 100,001 - 500,000 USDC&#x20;
* Tier 3: 500,001 - 1,000,000 USDC&#x20;
* Tier 4: 1,000,001 - 5,000,000 USDC&#x20;
* Tier 5: 5,000,001 - 10,000,000 USDC&#x20;

**Note:** All rewards are provided in Fuel tokens. Fuel tokens can be redeemed for trading fee discounts, access to exclusive features, or exchanged for other project tokens on the sprk.fi platform. This comprehensive rewards program ensures that market makers on sprk.fi are not only compensated for their contributions but also have the flexibility to redeem their Fuel tokens for a variety of benefits tailored to their preferences.
