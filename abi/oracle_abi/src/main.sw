library oracle_abi;

pub struct Price {
    asset_id: ContractId,
    price: u64,
    last_update: u64,
}

abi Oracle {
    #[storage(read)]
    fn owner() -> Address;

    #[storage(read, write)]
    fn initialize(owner: Address);

    #[storage(read, write)]
    fn set_price(asset_id: ContractId, price_value: u64);

    #[storage(read, write)]
    fn set_prices(prices: Vec<(ContractId, u64)>);

    #[storage(read)]
    fn get_price(asset_id: ContractId) -> Price;
}

