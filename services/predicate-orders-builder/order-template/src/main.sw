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
};

const GTF_OUTPUT_COIN_TO = 0x202;
const GTF_OUTPUT_COIN_ASSET_ID = 0x204;

/// Order / OTC swap Predicate
fn main() -> bool {
    const ASK_TOKEN = ContractId {
        value: ASK_TOKEN_CONFIG,
    };
    const RECEIVER = Address::from(RECEIVER_CONFIG);

    // Check if the transaction contains a single input coin from the receiver, to cancel their own order (in addition to this predicate)
    if input_count() == 2u8 {
        if input_owner(0).unwrap() == RECEIVER
            || input_owner(1).unwrap() == RECEIVER
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
    (to == RECEIVER) && (amount == ASK_AMOUNT) && (asset_id == ASK_TOKEN)
}
