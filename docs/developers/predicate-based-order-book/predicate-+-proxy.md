# Predicate + Proxy

{% embed url="https://github.com/compolabs/ethglobal-predicate/blob/master/src/main.sw" %}

This system uses a predicate to represent an order that can be filled by anyone. To create an order, the maker sends a coin to the predicate root, which can be unlocked by any transaction that meets the order's conditions. These conditions, such as transferring a specific amount of an asset to a receiver, are hard-coded into the predicate bytecode, making them specific to that order.

The order owner can then execute the order by spending the predicate coin in a transaction that meets the order's conditions. The owner can use the predicate coin in any way they wish, as long as the output of the transaction satisfies the order's conditions and is the first output in the output set.

To cancel an order, the maker can spend the predicate coin in a transaction that includes a single coin input signed by the receiver, with two inputs: the signed coin and the predicate coin.\
\
Alice will only provide information about the price and tokens in this predicate. Additionally, Alice can send additional money to the same predicate root to increase the amount of change.\
