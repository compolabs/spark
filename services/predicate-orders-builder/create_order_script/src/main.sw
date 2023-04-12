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
