script;

use std::constants::ZERO_B256;

abi LimitOrders {
    #[payable]
    #[storage(read, write)]
    fn deposit();

    #[payable]
    #[storage(read, write)]
    fn create_order(asset1: ContractId, amount1: u64, matcher_fee: u64) -> u64;
}

fn main(asset0: ContractId, amount0: u64, asset1: ContractId, amount1: u64) {
    let contract_address = 0x7662a02959e3e2d681589261e95a7a4bc8ac66c6d66999a0fe01bb6c36ada7c6;
    let caller = abi(LimitOrders, contract_address);
    let matcher_fee = 100000;
    caller.deposit {gas: 1000, coins: matcher_fee, asset_id: ZERO_B256}();
    let _order_id = caller.create_order {gas: 1000, coins: amount0, asset_id: asset0.into()}(asset1, amount1, matcher_fee);
}