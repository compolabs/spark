script;
use std::token::transfer_to_address;
use std::logging::log;

fn main(amount: u64, asset: ContractId, predicate_address: Address) {
    transfer_to_address(amount, asset, predicate_address);
}
