# Order template predicate

{% embed url="https://github.com/compolabs/spark/tree/master/services/predicate-orders-builder/order-template" %}

This system uses a predicate to represent an order that can be filled by anyone. To create an order, the maker sends a coin to the predicate root, which can be unlocked by any transaction that meets the order's conditions. These conditions, such as transferring a specific amount of an asset to a receiver, are hard-coded into the predicate bytecode, making them specific to that order.

The order owner can then execute the order by spending the predicate coin in a transaction that meets the order's conditions. The owner can use the predicate coin in any way they wish, as long as the output of the transaction satisfies the order's conditions and is the first output in the output set.

To cancel an order, the maker can spend the predicate coin in a transaction that includes a single coin input signed by the receiver, with two inputs: the signed coin and the predicate coin.

Partially filled development in progress: that means an order can not be partially filled - the taker must pay the entire ask amount.



{% hint style="info" %}
After updating to version 0.37.0 of the forc tool, the constants in the `forc.toml` file are now deprecated, which means we are required to insert the order data by modifying the `main.sw` file. The development team is currently working on a solution for this issue, and you can stay updated by following the forum topic dedicated to it: [https://forum.fuel.network/t/how-to-provide-constants-on-forc-v0-37-0-forc-toml-constants-outdated-on-forc-v0-37-0/2279/1](https://forum.fuel.network/t/how-to-provide-constants-on-forc-v0-37-0-forc-toml-constants-outdated-on-forc-v0-37-0/2279/1)
{% endhint %}



```rust
predicate;
mod utils; 
use utils::*;
use std::{
    inputs::{
        input_count,
        input_owner,
    },
    outputs::{
        Output,
        output_amount,
        output_pointer,
        output_type,
    },
};

const AMOUNT0: u64 = <AMOUNT0>;
const ASSET0: b256 = <ASSET0>;
const AMOUNT1: u64 = <AMOUNT1>;
const ASSET1: b256 = <ASSET1>;
const OWNER: b256 = <OWNER>;
const ORDER_ID: str[30] = <ORDER_ID>;

const OUTPUT_COIN_INDEX = 0u8;

fn main() -> bool {
    let owner = Address::from(OWNER);
    if input_count() == 2u8 {
        if input_owner(0).unwrap() == owner || input_owner(1).unwrap() == owner
        {
            return true;
        };
    };

    // Otherwise, evaluate the terms of the order:
    // The output which pays the receiver must be the first output
    let output_index = 0;

    // Revert if output is not an Output::Coin
    match output_type(output_index) {
        Output::Coin => (),
        _ => revert(0),
    };

    // Since output is known to be a Coin, the following are always valid
    let to = Address::from(output_coin_to(output_index));
    let asset_id = ContractId::from(output_coin_asset_id(output_index));

    let amount = output_amount(output_index);

    // Evaluate the predicate
    (to == owner) && (amount == AMOUNT1) && (asset_id == ContractId::from(ASSET1))
}


```

During the development of this predicate, we were inspired by [OTC-swap-predicate](https://github.com/fuelLabs/sway-applications/tree/master/OTC-swap-predicate)&#x20;
