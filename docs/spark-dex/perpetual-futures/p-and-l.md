# P\&L

Profit and Loss (P\&L or PnL) is a key concept in trading, representing the performance of a user's active positions. It helps traders assess whether they are making a profit or incurring a loss.

On Spark, a user's current position is the aggregated result of all their executed orders—whether they increase, reduce, or close positions—over time. This aggregation, encompassing all trading lots across different markets and subaccounts, is used to calculate P\&L.

The position table displays the P\&L for the existing position. Users have the option to view P\&L either in dollar value ("$") or as a percentage ("%").



The P\&L mentioned, particularly in the context of SOL-PERP and ETH-PERP shorts, pertains to the unrealized P\&L or uPNL of open positions. To convert this uPNL into realized profit or loss, positions must be closed.

The PnL in the table is determined by calculating the difference between the entry price of the position and the current time-weighted average price of trades, multiplied by the size of the position.



### Realized P\&L

Realized P\&L represents the profit or loss that a user actually incurs upon closing their trading position.

For instance:

* If you initiate a long position in ETH at $1000, and its price rises to $1500, you have an unrealized P\&L of $500. This indicates a profit, but it's not yet realized because the position is still open.
* Conversely, if you start a short position in ETH at $1000, and its price falls to $750, your unrealized P\&L is $250, indicating a profit in this scenario as well.

These examples illustrate unrealized P\&L (uP\&L), which fluctuates with the ongoing price changes of the asset. This uP\&L remains hypothetical as long as the position is open.

Your P\&L is not finalized or 'realized' until the position is closed. When you close your position, your uP\&L transforms into realized P\&L. At this point, you exit the perpetual futures position, meaning you no longer have exposure to the price movement of that specific asset.



### Withdrawals

When considering withdrawals, only the lower amount between your Free Collateral and Asset Balance is available for withdrawal. By realizing positive unrealized P\&L, such as through reducing or closing positions, this P\&L can be transferred to your Asset Balance, making it available for withdrawal.

For users who wish to maintain their position while also withdrawing profits that exceed their current asset balance, a strategy is to partially or fully close their position and then re-enter it. This approach allows them to realize some profits, add them to their Asset Balance, and then withdraw, while still maintaining a presence in the market by reopening the position.



