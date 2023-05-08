# Create order script

{% embed url="https://github.com/compolabs/spark/tree/master/services/predicate-orders-builder/create_order_script" %}

Create order script performs two actions: it sends funds to the predicate, thereby initiating the creation of an order and makes a log with the parameters of the order, which will help in indexing the order

```rust
script;
use std::token::transfer_to_address;
use std::logging::log;

struct CreateOrderParams {
    id: str[30],
    predicate_address: Address,
    amount0: u64,
    asset0: ContractId,
    amount1: u64,
    asset1: ContractId,
    owner: Address,
}
fn main(params: CreateOrderParams) {
    log(params);
    transfer_to_address(params.amount0, params.asset0, params.predicate_address);
}

```
