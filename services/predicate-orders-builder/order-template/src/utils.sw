library;
use std::constants::ZERO_B256;

////////////
// Inuput //
////////////
const GTF_INPUT_COIN_AMOUNT = 0x105;
const GTF_INPUT_COIN_ASSET_ID = 0x106;
// const GTF_SCRIPT_SCRIPT_LENGTH = 0x005;
// const GTF_SCRIPT_SCRIPT = 0x00B;
pub fn input_coin_asset_id(index: u64) -> b256 {
    __gtf::<b256>(index, GTF_INPUT_COIN_ASSET_ID)
}

/// Get the amount of a coin input
pub fn input_coin_amount(index: u64) -> u64 {
    __gtf::<u64>(index, GTF_INPUT_COIN_AMOUNT)
}

/// Get the hash of the script bytecode
// pub fn tx_script_bytecode_hash() -> b256 {
//     let mut result_buffer = ZERO_B256;
//     asm(hash: result_buffer, ptr: __gtf::<u64>(0, GTF_SCRIPT_SCRIPT), len: __gtf::<u64>(0, GTF_SCRIPT_SCRIPT_LENGTH)) {
//         s256 hash ptr len;
//         hash: b256
//     }
// }
// const GTF_SCRIPT_GAS_PRICE = 0x002;
// const GTF_SCRIPT_GAS_LIMIT = 0x003;
/// Get the transaction gas price
// pub fn tx_gas_price() -> u64 {
//     __gtf::<u64>(0, GTF_SCRIPT_GAS_PRICE)
// }

// /// Get the transaction gas price
// pub fn tx_gas_limit() -> u64 {
//     __gtf::<u64>(0, GTF_SCRIPT_GAS_LIMIT)
// }

////////////
// OUTPUT //
////////////
/// Get the transaction outputs count
// const GTF_SCRIPT_OUTPUTS_COUNT = 0x008;
// const GTF_OUTPUT_TYPE = 0x201;
// const OUTPUT_TYPE_COIN = 0u8; // again... not sure aboue this type here. 
const GTF_OUTPUT_COIN_TO: u64 = 0x202;
// const GTF_OUTPUT_COIN_AMOUNT: u64 = 0x203;
const GTF_OUTPUT_COIN_ASSET_ID: u64 = 0x204;
// pub fn output_count() -> u64 {
//     __gtf::<u64>(0, GTF_SCRIPT_OUTPUTS_COUNT)
// }
// pub fn verify_output_coin(index: u64) -> bool {
//     __gtf::<u64>(index, GTF_OUTPUT_TYPE) == OUTPUT_TYPE_COIN
// }

pub fn output_coin_asset_id(index: u64) -> b256 {
    __gtf::<b256>(index, GTF_OUTPUT_COIN_ASSET_ID)
}
// pub fn output_coin_amount(index: u64) -> u64 {
//     __gtf::<u64>(index, GTF_OUTPUT_COIN_AMOUNT)
// }
pub fn output_coin_to(index: u64) -> b256 {
    __gtf::<b256>(index, GTF_OUTPUT_COIN_TO)
}