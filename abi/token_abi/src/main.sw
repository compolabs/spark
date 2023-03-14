library token_abi;

abi Token {
    // Initialize contract
    #[storage(read, write)]
    fn initialize(config: TokenInitializeConfig, mint_amount: u64, address: Address);

    #[storage(read, write)]
    fn add_reward_admin(address: Address);

    #[storage(read, write)]
    fn delete_reward_admin(address: Address);

    #[storage(read)]
    fn is_reward_admin(address: Address) -> bool;
    // Set mint amount for each address
    #[storage(read, write)]
    fn set_mint_amount(mint_amount: u64);
    // Get balance of the contract coins
    fn get_balance() -> u64;
    // Return the mint amount
    #[storage(read)]
    fn get_mint_amount() -> u64;
    // Get balance of a specified token on contract
    fn get_token_balance(asset_id: ContractId) -> u64;
    // Mint token coins
    #[storage(read)]
    fn mint_coins(mint_amount: u64);
    // Mint token coins
    #[storage(read)]
    fn mint_and_transfer(amount: u64, recipient: Address);
    // Burn token coins
    #[storage(read)]
    fn burn_coins(burn_amount: u64);
    // Transfer a contract coins to a given output
    #[storage(read)]
    fn transfer_coins(coins: u64, address: Address);
    // Transfer a specified token from the contract to a given output
    #[storage(read)]
    fn transfer_token_to_output(coins: u64, asset_id: ContractId, address: Address);
    // Method called from address to mint coins
    #[storage(read, write)]
    fn mint();
    // Config of token
    #[storage(read)]
    fn config() -> TokenInitializeConfig;
    // Is user already minted test token
    #[storage(read)]
    fn already_minted(address: Address) -> bool;

    fn caller() -> Address;
}

pub struct TokenInitializeConfig {
    name: str[32],
    symbol: str[8],
    decimals: u8,
}

