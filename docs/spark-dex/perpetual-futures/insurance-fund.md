# Insurance Fund

Spark's Insurance Fund plays a crucial role in preserving the exchange's solvency, especially in scenarios involving bankruptcies. Here's a breakdown of its necessity, usage, funding, and the concept of socialized loss:

### **Necessity of the Insurance Fund**

* The Insurance Fund is vital to safeguard against leveraged losses that users might incur. During periods of high market volatility, some accounts may not be liquidated promptly or at their zero price, potentially resulting in account balances dropping below zero. This means that these accounts incur more unrealized loss than the collateral available, leaving the exchange responsible for the 'bad debt'.
* The fund acts as a buffer, ensuring the solvency of the protocol and providing assurance to users that the exchange can cover a certain amount of leveraged losses per market.

### **Usage of the Insurance Fund**

* The Insurance Fund is primarily utilized to cover liabilities in the event of an account's bankruptcy.
* It automatically covers bankruptcy losses up to the maximum insurance limit set for each perpetual market.

### **Funding the Insurance Fund**

* The fund is replenished with half of the premiums collected from liquidation penalties and trading fees.
* Since trading fees are accumulated in USDC, these funds are pooled into the USDC pool. This pool then acts as a backstop against bankruptcies in each perpetual market.
* Any losses exceeding the predefined limits are managed through a socialized loss mechanism.

### **Socialized Loss Explained**

* Socialized loss refers to a situation where the losses incurred on the platform are distributed across all users' deposits and/or positions.
* This occurs when leveraged losses in a particular market surpass the insurance fund's allocated token balance for that market, indicating that deleveraging was insufficient to mitigate the bad debt.
* In such cases, the incurred losses are proportionally distributed among all open positions, with each participant bearing a share of the loss relative to their base position size.

Overall, the Insurance Fund and the socialized loss mechanism are integral to managing risks and ensuring the stability of the trading platform, especially under extreme market conditions.
