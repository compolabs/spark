# Risk Parameters

1. Exponential Moving Average (EMA): EMA gives more weight to the recent prices, and thus reacts more quickly to price changes than the simple moving average (SMA). It's used here to gauge the average slippage over a given period.
2. Conditional Value-at-Risk (CVaR): It estimates potential losses in worst-case scenarios. It's different from Value-at-Risk (VaR) as it considers the average of all financial losses that occur in the worst (1-confidence level)% of cases.
3. Alpha (Confidence Interval): We update this as it affects the severity of the maintenance margin. A higher alpha means a lower maintenance margin, whereas a lower alpha means a higher maintenance margin. The alpha will be calculated by Fibonacci’s risk dashboard and updated by the owner/admin.
4. Maintenance Margin You can think of this as the liquidation threshold in the worst case scenario for any market. It is based on the CVaR and EMA of the slippage of the market that you are trading in. You can think about it as the absolute riskiest position that we would allow each trading position to be in when we MUST sell it. The maintenance margin for each market will be determined by the owner account. So if you have a maintenance margin of 10%, you need at least $10 worth of collateral in your account to not be liquidated on a $100 initial position. The maintenance margin for each market will be determined by updates from the owner for the following variables:
5. Liquidation Buffer: The absolute minimum amount over the maintenance margin at which we liquidate positions. For instance, a liquidation buffer of 1.05 would mean that we liquidate positions at 5% above the maintenance margin.
6. Opening Buffer: the user’s minimum collateral needed to not immediately be liquidated, expressed as opening\_buffer \* maintenance\_margin. The product of these is Initial Margin. For example, an opening buffer of 1.10 and a maintenance margin of 10% for Market A would mean that the max amount of leverage that a user could take in this market would be:

$$
Minimum Collateral = Position Size × Maintenance Margin × Opening Buffer
$$
