# Funding Rates

Funding payments are a crucial component in perpetual futures markets, designed to align the market price of the derivative closely with the index price of the underlying real asset. The mechanics of funding payments are as follows:

* **Funding Payments**: These are either paid or earned by traders depending on their influence on the market price relative to the index price.
  * Paid by traders if their actions move the market price further from the index price.
  * Earned by traders if their actions help align the market price closer to the index price.

### **Key Terms**

* **Market Price**: The current price of the perpetual futures.
* **Index Price**: The spot price of the actual asset.

### **Earning or Paying Funding**

* A positive payment indicates that you have paid this amount as funding.
* A negative payment means you have earned this amount in funding.

### **Liquidation Risks**

* Paying funding can decrease your margin ratio, potentially leading to liquidation if positions are not actively monitored.
* Liquidation processes consider unrealized funding payments.

### **Funding Rate and Payments**

* Funding payments are calculated for each open position based on the cumulative funding rate since your last position opening or funding settlement.
* Funding is not calculated at fixed intervals but continuously as long as your position is open.

### **Funding Period and Settlement**

* Funding settlement can occur under various conditions, such as adding/removing liquidity, opening/closing positions, or during liquidation.
* All markets settle funding when withdrawing collateral.

### **Funding Payment Calculation**

* Funding payments are computed per-block based on a cumulative time-weighted premium, which is updated at the start of each block.
* Personal funding payments are settled when users have pending funding payments.
* The calculation involves the cumulative time-weighted premium multiplied by the position size.

### **Examples**

* If the market price is lower than the index price, short position holders pay funding while long position holders earn funding, and vice versa.
* The cumulative time-weighted premium is determined by summing each premium and its duration.

In essence, funding payments act as a balancing mechanism in perpetual futures markets, incentivizing traders to help maintain the market price in line with the real asset's spot price.
