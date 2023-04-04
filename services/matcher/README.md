# Spark Order Matching Engine
## Version warning
The master branch contains the latest work-in-progress version of Spark Order Matching Engine. It hasn't been audited and may contain severe security issues or may not work at all.

## About

This repository contains a program that matches orders on the Fuel Network, allowing users to trade cryptocurrencies with each other. 
Limit order itself is a data structure created off-chain.

The matching engine works by using a smart contract that calculates the prices of different orders and then matches them based on those prices. 
Users create limit orders, which are a way to specify a buying or selling price for a cryptocurrency. The matching engine then matches the buy and sell orders with the best possible price. 
Once matched, the orders are executed by transferring cryptocurrency from one user to another, according to the agreed upon price. The program includes various test cases to ensure its proper functioning.

The architecture of the Spark Order Matching Engine is based on a smart contract that uses a matching function to calculate the prices of the assets being traded. The engine also calculates the lowest price of an order and transfers the assets accordingly.

To explain the process, let us consider a few examples:

Example 1: If there are two orders, Order0 and Order1, where Order0 is for 20k USDT for 1 BTC at a price of 0.00005 and Order1 is for 0.51 BTC for 10k USDT at a price of 0.000051. The engine calculates that the order with the lowest price is Order0, and transfers 10k USDT from Order0 to Order1, and 0.5 BTC from Order1 to Order0. The remaining 0.01 BTC is transferred to the owner of Order1.

Example 2: If Order0 is for 10k USDT for 0.5 BTC at a price of 0.00005 and Order1 is for 1.02 BTC for 20k USDT at a price of 0.000051. The engine calculates that the order with the lowest price is Order0, and transfers 10k USDT from Order0 to Order1, and 0.5 BTC from Order1 to Order0. The remaining 0.01 BTC is transferred to the owner of Order1.

The engine also includes a set of test cases to ensure that the orders are matched correctly. 


## Order Matching Engine Architecture  

### Smart contract `match_orders` function  logic
#### Prices calculation
```
price_0 = asset1 / asset0
price_1 = asset0 / asset1
```

* order0 is the order with the lowest price `price_a <= price_b`
* if orders have the same price, then order0 is the order from the first argument




#### If  `order0_amount0 >= order1_amount1`

Examples
- a) Order0 : 20k USDT ➡️ 1 BTC | price: 0.00005
     Order1: 0.51 BTC ➡️ 10k USDT | price: 0.000051
- b) Order0: 20k USDT ➡️ 1 BTC | price: 0.00005
     Order1: 0.5 BTC ➡️ 10k USDT | price: 0.00005
- c) Order0: 20k USDT ➡️ 1 BTC | price: 0.00005
     Order1: 1.02 BTC ➡️ 20k USDT | price: 0.000051
- d) Order0: 20k USDT ➡️ 1 BTC | price: 0.00005
     Order1: 1 BTC ➡️ 20k USDT | price: 0.00005

```
order0_fulfill_percent = order1_amount1 / order0_amount0 * 100

a,b: order0_fulfill_percent = 10k / 20k * 100 = 50 %
c,d: order0_fulfill_percent = 20k / 20k * 100 = 100 %
```

#### Transactions
* Transfer order1_amount1 (a,b: 10k USDT; c,d: 20k USDT) from order0 to order1
* Transfer order0_fulfill_percent * order0_amount1 / 100 (a,b: 0.5 BTC; c,d: 1 BTC) from order1 to order0
* Transfer order1_amount0 - order0_fulfill_percent * order0_amount1 / 100 (a: 0.01 BTC; b: 0 BTC; c: 0.02 BTC; d: 0 BTC) from order1 to order1.owner 
* Order1 completed 
* if order0_amount0 == order1_amount1 order0 completed (c,d) 


#### If  `order0_amount0 < order1_amount1`

Examples 
- a) Order0: 10k USDT ➡️ 0.5 BTC | price: 0.00005
     Order1: 1.02 BTC ➡️ 20k USDT | price: 0.000051
- b) Order0: 10k USDT ➡️ 0.5 BTC | price: 0.00005
     Order1: 1 BTC ➡️ 20k USDT | price: 0.00005
```
order1_fulfill_percent = order0_amount1 / order1_amount0 * 100

a,b: order1_fulfill_percent = 10k / 20k * 100 = 49 с хуем %
```
#### Transactions
* Transfer order0_amount0 (10k USDT) from order0 to order1
* Transfer order0_amount1 (0.5 BTC) from order1 to order0
* Transfer order1_amount0 * order1_fulfill_percent - order0_amount1 (a: 0.01 BTC, b: 0 BTC) from order1 to order1.owner
* Order0 completed

## Test cases

### Positive test cases
Order a will be matched with order b, order c is needed to close biggest order to make sure the contract delivers exactly as expected.

1. price_a < price_b && order_a_amount0 > order_b_amount1
Order a: 20k USDT ➡️ 1 BTC | price: 0.00005
Order b: 0.51 BTC ➡️ 10k USDT | price: 0.000051

2. price_a < price_b && order_a_amount0 == order_b_amount1
Order a: 20k USDT ➡️ 1 BTC | price: 0.00005
Order b: 1.02 BTC ➡️ 20k USDT | price: 0.000051

3. price_a < price_b && order_a_amount0 < order_b_amount1
Order a: 10k USDT ➡️ 0.5 BTC | price: 0.00005
Order b: 1.02 BTC ➡️ 20k USDT | price: 0.000051

4. price_a == price_b && order_a_amount0 > order_b_amount1
Order a: 20k USDT ➡️ 1 BTC | price: 0.00005
Order b: 0.5 BTC ➡️ 10k USDT | price: 0.00005

5. price_a == price_b && order_a_amount0 == order_b_amount1
Order a: 20k USDT ➡️ 1 BTC | price: 0.00005
Order b: 1 BTC ➡️ 20k USDT | price: 0.00005

6. price_a == price_b && order_a_amount0 < order_b_amount1
Order a: 10k USDT ➡️ 0.5 BTC | price: 0.00005
Order b: 1 BTC ➡️ 20k USDT | price: 0.00005

### Negative test cases

1. price_a > price_b && order_a_amount0 > order_b_amount1 
Order a: 20k USDT ➡️ 1.02 BTC | price: 0.000051
Order b: 0.5 BTC ➡️ 10k USDT | price: 0.00005

2. price_a > price_b && order_a_amount0 == order_b_amount1
Order a: 20k USDT ➡️ 1.02 BTC | price: 0.000051
Order b: 1 BTC ➡️ 20k USDT | price: 0.00005

3. price_a > price_b && order_a_amount0 < order_b_amount1
Order a: 10k USDT ➡️ 0.51 BTC | price: 0.000051
Order b: 1 BTC ➡️ 20k USDT | price: 0.00005

4. order_a.asset0 != order_b.asset1
Order a: 10k USDT ➡️ 0.51 BTC
Order b: 1 BTC ➡️ 20k USDC
