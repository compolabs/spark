# 💫 Basics

<figure><img src="../../.gitbook/assets/2 (2).png" alt=""><figcaption></figcaption></figure>

Here are some of the more technical features of our MVP launch:

* Market Makers can earn rewards for active market-making (up to 3000 USDC each week)
* We will rely on oracles (Pyth and Redstone) to track the prices of our contracts
* Profit, Liquidations, and Losses will be settled permissionless

We rely on two oracles and will utilize industry-best standards in Oracle pricing. Some of the measures that we take to ensure that a Mango-Markets style exploit is impossible to include:

**Multi-Oracle Systems**: mitigate risks stemming from any single oracle's potential failure or manipulation. ✅

**Time Delays:**  We use a time delay to prevent manipulation attacks and allow for time to check for extreme deviations/outliers.

For the MVP Launch, we will also include an **Internal Backup Database**



<figure><img src="../../.gitbook/assets/scheme.png" alt=""><figcaption></figcaption></figure>
