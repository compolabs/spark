# Sway Network Limit Orders Smart Contract
## Version warning
The master branch contains the latest work-in-progress version of Sway Network smart contract. It hasn't been audited and may contain severe security issues or may not work at all.

## About

This repository contains a smart contract for Fuel blockchain which allows users to place limit orders orderbook, that later could be filled and matched on-chain. Limit order itself is a data structure created off-chain.

## Docs

 ### Contract Storage

 ```
storage {
    orders: StorageMap<u64, Order> = StorageMap {},
    orders_amount: u64 = 0,
    deposits: StorageMap<Address, u64> = StorageMap {},
    trades: StorageVec<Trade> = StorageVec {},
}
 ```

 ### Abi
 ```
abi LimitOrders {
    #[storage(read)]
    fn get_deposit_by_address(address: Address) -> u64;

    #[payable]
    #[storage(read, write)]
    fn deposit();

    #[storage(read, write)]
    fn withdraw(amount: u64);

    #[storage(read)]
    fn orders_amount() -> u64;

    #[storage(read)]
    fn trades(offset: u64) -> (Option<Trade>, Option<Trade>, Option<Trade>, Option<Trade>, Option<Trade>, Option<Trade>, Option<Trade>, Option<Trade>, Option<Trade>, Option<Trade>);

    #[storage(read)]
    fn orders(offset: u64) -> (Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>);

    #[storage(read)]
    fn orders_by_id(ids: [u64; 10]) -> (Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>, Option<Order>);

    #[storage(read)]
    fn order_by_id(id: u64) -> Order;

    #[payable]
    #[storage(read, write)]
    fn create_order(asset1: ContractId, amount1: u64, matcher_fee: u64) -> u64;

    #[storage(read, write)]
    fn cancel_order(id: u64);

    #[payable]
    #[storage(read, write)]
    fn fulfill_order(id: u64);

    #[storage(read, write)]
    fn match_orders(order_id_a: u64, order_id_b: u64);
}

 ```

 ### Structs
 #### Order
 ```
 pub struct Order {
    asset0: ContractId,
    amount0: u64,
    asset1: ContractId,
    amount1: u64,
    status: Status,
    fulfilled0: u64,
    fulfilled1: u64,
    owner: Address,
    id: u64,
    timestamp: u64,
    matcher_fee: u64,
    matcher_fee_used: u64,
}
 ```

 #### Trade

 ```
 struct Trade {
    order_id: u64,
    asset0: ContractId,
    amount0: u64,
    asset1: ContractId,
    amount1: u64,
    timestamp: u64,
}
```

### Enums
#### Status
```
enum Status {
    Active: (),
    Canceled: (),
    Completed: (),
}
```
