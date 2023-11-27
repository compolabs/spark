# Spark Points Earning Program

**Description**

**Spark Points Earning Program**

_Introduction:_ The Spark Points program is designed to reward liquidity providers and traders on the [Spark.fi](http://spark.fi) protocol. Participants earn Spark Points based on their contributions to the order book, promoting liquidity, and actively engaging in trades. These points can be redeemed for various benefits within the [Spark.fi](http://spark.fi) ecosystem.

#### **Liquidity Provision Program:**

**Formula:**

```makefile
makefileCopy code
LP_Spark_Points = (Liquidity_USDC * Days * LP_Weight) / 1000
```

**Example:** Suppose a user provides $8,000 in USDC liquidity for 30 days with an LP\_Weight of 0.001. The Spark Points calculation would be:

```bash
bashCopy code
LP_Spark_Points = ($8,000 * 30 * 0.001) / 1000 = 24 Spark Points
```

#### **Trading Program:**

**Formula:**

```makefile
makefileCopy code
Trader_Spark_Points = (Trading_Volume * Trades * Trader_Weight) / 1000
```

**Example:** If a trader executes $50,000 in trading volume with a frequency of 20 trades and a Trader\_Weight of 0.002, the Spark Points calculation would be:

```bash
bashCopy code
Trader_Spark_Points = ($50,000 * 20 * 0.002) / 1000 = 2,000 Spark Points
```

#### **Market Program:**

**Formula:**

```makefile
makefileCopy code
Market_Spark_Points = (Total_Liquidity * Market_Weight) / 1000
```

**Example:** Suppose the total liquidity across supported pairs reaches $1,000,000 with a Market\_Weight of 0.001. The Spark Points calculation for the Market Program would be:

```bash
bashCopy code
Market_Spark_Points = ($1,000,000 * 0.001) / 1000 = 1,000 Spark Points
```

***

**Program Description:**

In addition to liquidity provision and trading, the Spark Points Earning Program introduces a Market Program to incentivize overall market health. Users earn Spark Points based on the total liquidity across supported pairs, encouraging the growth and stability of the ecosystem.

**Market Program:**

* Users earn Spark Points based on the total liquidity in the market.
* Market\_Weight determines the weight assigned to the overall market health, influencing Spark Points earnings.

**Conversion to Spark and Fuel Tokens:**

* Users can convert Spark Points to Spark Tokens at a 1:1 ratio.
* 1 Spark Point = 1 Spark Token.
* Users can further convert Spark Tokens to Fuel Tokens at a rate of 300 Spark Tokens for 1 Fuel Token.

These conversion mechanisms provide flexibility and additional benefits for users within the ecosystem.

_**FAQs:**_

1. **How are Spark Points calculated for liquidity provision?**
   * Spark Points for liquidity provision are calculated using a formula that considers the user's contribution relative to the total liquidity in the order book.
2. **What assets are eligible for earning Spark Points?**
   * Spark Points can be earned for liquidity provision and trading in USDС.
3. **How can Spark Points be redeemed?**
   * Users can exchange Spark Points for Spark Tokens, which can be redeemed for project tokens, trading fee discounts, or access to exclusive features.
4. **What determines the weighting factor for assets?**
   * The weighting factor is predetermined based on the asset's importance and demand within the [Spark.fi](http://spark.fi) ecosystem.
5. **How frequently are Spark Points updated?**
   * Spark Points are updated in real-time, reflecting users' contributions and activities on the [Spark.fi](http://spark.fi) platform.
