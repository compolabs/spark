# Liquidations

Leveraged trading amplifies trading power by allowing you to trade with more funds than you actually possess, essentially borrowing from the exchange. However, this comes with the risk of liquidation to protect the exchange from losses.

### **Liquidation Trigger**

* Spark calculates liquidation based on the index price.
* Liquidation occurs when your position margin ratio falls below the maintenance margin ratio, determined by the time-weighted average price (TWAP) of the index price.
* Positions worth $100 or less are fully liquidated, whereas larger positions may be partially liquidated.

### **Liquidation Price**

* Each position has a specific liquidation price, influenced by your collateral amount and the P\&L of each position. Changes in deposits, withdrawals, and funding payments impact your collateral, altering the liquidation price.

### **Cross-margin**

* The P\&L of each position affects the liquidation price of your other positions. Gains in one position can decrease the liquidation price for longs or increase it for shorts.

### **Liquidation Penalty**

* Part or all of your margin can be taken as a liquidation penalty. With cross-collateral, liquidators typically target the largest position for maximum liquidation.
* The liquidation amount depends on the liquidator's available margin and competition with other liquidators. Liquidators may opt for partial liquidations to enhance their chances of success.

### **Calculating Liquidation Price**&#x20;

\#long

$$
liqPrice = indexPrice - ((accountValue - totalPositionValue * mmRatio) /  ((1 - mmRatio) * positionSizeOfTokenX))
$$



\#short

$$
liqPrice = indexPrice - ((accountValue - totalPositionValue * mmRatio) /  ((1 + mmRatio) * positionSizeOfTokenX))
$$



### **Example**

To demonstrate the calculation of liquidation prices, consider this example:

Imagine the index price of ETH is $2,000, and you have $100 in collateral, setting your account value at $100. Suppose you initiate a 0.10 ETH position, making the total position value $200. The maintenance margin ratio (mmRatio) is 6.25%, and the position size of the base token (positionSizeOfTokenX) is +0.10.

For a long position, the liquidation price is calculated as follows:&#x20;

$$Liquidation Price=2000−(1−0.0625)×0.10(100−200×0.0625)​$$ $$=2000−(100−12.5)(0.9375×0.10)=2000−(0.9375×0.10)(100−12.5)​$$ $$=2000−87.50.09375=2000−0.0937587.5​$$ $$=2000−933.3333=2000−933.3333$$ $$=1066.6666=1066.6666$$&#x20;

Hence, a 0.10 ETH long position, entered at $2,000 with $100 collateral, faces liquidation when the index price drops to $1066.6666.



For a short position with identical inputs but a negative position:&#x20;

$$Liquidation Price=2000−(1+0.0625)×−0.10(100−200×0.0625)​$$ $$=2000−(100−12.5)(1.0625×−0.10)=2000−(1.0625×−0.10)(100−12.5)​$$ $$=2000−87.5−0.10625=2000−−0.1062587.5​$$ $$=2000−(−823.5294)=2000−(−823.5294)$$ $$=2823.5294=2823.5294$$&#x20;

So, a 0.10 ETH short position, also entered at $2,000 with $100 collateral, will be liquidated when the index price rises to $2823.5294.

### **Liquidators**

* Liquidations are executed by keeper bots, which are coded and run by individuals.
* These bots trigger liquidations through the clearinghouse contract, which assesses if the conditions for liquidation are met. Successful liquidations earn liquidators a bonus from the collateral of the liquidated position.

These bots call the clearinghouse contract to trigger the liquidations, and the clearinghouse determines whether a position meets the conditions for liquidations or not. Liquidators receive a bonus when successfully triggering a liquidation, paid from a portion of the collateral backing the liquidated position.
