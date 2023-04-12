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
//------------------------------------------------------------------------
// configurable {
//     ASK_AMOUNT: u64 = 0,
//     ASK_TOKEN_CONFIG: b256 = 0x0000000000000000000000000000000000000000000000000000000000000000,
//     RECEIVER_CONFIG: b256 = 0x0000000000000000000000000000000000000000000000000000000000000000,
// }
//------------------------------------------------------------------------
const ASK_AMOUNT: u64 = <ASK_AMOUNT>;
const ASK_TOKEN_CONFIG: b256 = <ASK_TOKEN_CONFIG>;
const RECEIVER_CONFIG: b256 = <RECEIVER_CONFIG>;
//------------------------------------------------------------------------

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


    // assert(tx_script_bytecode_hash() == SPENDING_SCRIPT_HASH);
  
    // assert(input_coin_asset_id(0) == ASSET1);
    // assert(input_coin_amount(0) >= AMOUNT1);

    // assert(output_count() == 2);
    // assert(verify_output_coin(OUTPUT_COIN_INDEX));
    // assert(output_coin_asset_id(OUTPUT_COIN_INDEX) == ASSET0);
    // assert(output_coin_amount(OUTPUT_COIN_INDEX) >= AMOUNT0);

    // assert(output_coin_to(OUTPUT_COIN_INDEX) == OWNER);
    