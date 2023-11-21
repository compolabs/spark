---
description: >-
  Utilizing predicates within Spark to coordinate a swap without the need for
  smart contracts.
---

# 📓 SDK Docs



{% hint style="info" %}
In Sway programming language, predicates are essentially programs that evaluate either true or false, without any side effects. They are used to specify conditions or requirements that need to be met in order for a certain action to be executed.

In the context of the Sway, a predicate is a script that specifies the rules for a transaction to be valid. When a predicate is included in a transaction, it is executed on the blockchain to determine if the transaction meets the specified conditions. Predicates can be used for various purposes, including smart contract conditions, multisig requirements, and more.

Predicates are associated with a predicate address, which is generated from the compiled byte code and is similar to a P2SH address used in Bitcoin. This address can own assets, and users can send assets to it just like any other address. However, to spend the assets associated with the predicate address, the user must provide the original byte code of the predicate along with the predicate data. If the predicate is validated successfully, the assets can be transferred to the desired destination.
{% endhint %}

{% embed url="https://github.com/compolabs/spark-sdk-example" %}
Tutorial on how to send the txs via Spark Order book
{% endembed %}

### How do predicates work with limit orders?

Predicates are not deployed to the chain as smart contracts. Instead, they are represented by a hash that locks some coins. If a user can provide the bytecode that generates that hash and makes the predicate evaluate to true, then they can spend the locked coins. This means that when creating a limit order using predicates, the user just needs to send coins to the code hash. When executing the order, the transaction only needs to make the predicate return true. The predicate's role is to ensure that the taker sends enough coins to the maker, allowing them to spend the predicate as they wish. With this innovative approach, Sway has introduced a new level of flexibility and efficiency to the world of decentralized finance.

### What makes this DEX architecture unique compared to others?

There have been two primary DEX architecture strategies implemented so far: the uniswap style automated market maker (AMM) that can function entirely within smart contracts, and the off-chain order book with on-chain settlement used by platforms like DYDX, 0x, and OpenSea. Both have downsides, such as reduced capital efficiency in the case of the AMM, and centralized components and potential regulation in the case of off-chain order books.

Fuel Labs has introduced a new architecture that uses predicates to enable a fully on-chain order book. Since creating an order is simply a transfer, there is no costly state writing problem. As long as there is a data availability layer that allows the public to observe the orders, they can be fully verified on-chain by checking the predicate balance. The predicate order book offers the capital efficiency advantages of a centralized limit order book without sacrificing decentralization.

### Modules

* Predicate + Proxy
* Trading View Datafeed
* Data service
* Matcher engine
* Frontend

<figure><img src="../.gitbook/assets/Screenshot 2023-11-03 at 17.00.45.png" alt=""><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/Screenshot 2023-11-03 at 17.00.52.png" alt="" width="375"><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/Screenshot 2023-11-03 at 17.01.00.png" alt="" width="375"><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/Screenshot 2023-11-03 at 17.01.06.png" alt="" width="375"><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/Screenshot 2023-11-03 at 17.01.12.png" alt="" width="375"><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/Screenshot 2023-11-03 at 17.01.18.png" alt="" width="375"><figcaption></figcaption></figure>
