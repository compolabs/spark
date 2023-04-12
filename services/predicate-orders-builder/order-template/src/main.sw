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


