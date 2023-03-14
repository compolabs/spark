predicate;

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
    logging::log,
};

// TODO : Remove once __gtf getters implemented in std-lib
const GTF_OUTPUT_COIN_TO = 0x202;
const GTF_OUTPUT_COIN_ASSET_ID = 0x204;

/// Order / OTC swap Predicate
fn main() -> bool {
    // Order conditions: These are set in Forc.toml
    // The spending transaction must have an output that sends `AMOUNT_1` of `ask_token` to `receiver`

    // Check if the transaction contains a single input coin from the receiver, to cancel their own order (in addition to this predicate)
    let owner = Address::from(ORDER_OWNER);
    if input_count() == 2u8 {
        if input_owner(0).unwrap() == owner
            || input_owner(1).unwrap() == owner
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
    let to = Address::from(__gtf::<b256>(output_index, GTF_OUTPUT_COIN_TO));
    let asset_id = ContractId::from(__gtf::<b256>(output_index, GTF_OUTPUT_COIN_ASSET_ID));

    let amount = output_amount(output_index);

    // Evaluate the predicate
    (to == owner) && (amount == AMOUNT_1) && (asset_id.into() == ASSET_1)
}
