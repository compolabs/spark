# Sway Exchange Order Matching Engine
## Version warning
The master branch contains the latest work-in-progress version of Sway Exchange Order Matching Engine. It hasn't been audited and may contain severe security issues or may not work at all.

## About

This repository contains a Order Matching Engine for Fuel blockchain which allows users to match limit orders on-chain. Limit order itself is a data structure created off-chain.


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