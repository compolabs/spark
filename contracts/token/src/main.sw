contract;

use std::{
    address::*,
    auth::{
        AuthError,
        msg_sender,
    },
    call_frames::{
        contract_id,
        msg_asset_id,
    },
    constants::ZERO_B256,
    context::{
        balance_of,
        msg_amount,
    },
    contract_id::ContractId,
    revert::require,
    storage::*,
    token::*,
};
use token_abi::*;

storage {
    config: TokenInitializeConfig = TokenInitializeConfig {
        name: "                                ",
        symbol: "        ",
        decimals: 1u8,
    },
    owner: Address = Address::from(ZERO_B256),
    reward_admins: StorageMap<Address, bool> = StorageMap {},
    mint_amount: u64 = 0,
    mint_list: StorageMap<Address, bool> = StorageMap {},
}

enum Error {
    AddressAlreadyMint: (),
    CannotReinitialize: (),
    MintIsClosed: (),
    NotOwner: (),
}

pub fn get_msg_sender_address_or_panic() -> Address {
    let sender: Result<Identity, AuthError> = msg_sender();
    if let Identity::Address(address) = sender.unwrap() {
        address
    } else {
        revert(0);
    }
}

#[storage(read)]
fn validate_owner() {
    let sender = get_msg_sender_address_or_panic();
    require(storage.owner == sender, Error::NotOwner);
}

impl Token for Contract {
    //////////////////////////////////////
    // Owner methods
    //////////////////////////////////////
    #[storage(read, write)]
    fn initialize(
        config: TokenInitializeConfig,
        mint_amount: u64,
        owner: Address,
    ) {
        require(storage.owner.into() == ZERO_B256, Error::CannotReinitialize);
        storage.owner = owner;
        storage.mint_amount = mint_amount;
        storage.config = config;
    }

    #[storage(read, write)]
    fn add_reward_admin(address: Address) {
        validate_owner();
        storage.reward_admins.insert(address, true);
    }

    #[storage(read, write)]
    fn delete_reward_admin(address: Address) {
        validate_owner();
        storage.reward_admins.insert(address, false);
    }

    #[storage(read)]
    fn is_reward_admin(address: Address) -> bool {
        validate_owner();
        storage.reward_admins.get(address).is_some() && storage.reward_admins.get(address).unwrap()
    }

    #[storage(read, write)]
    fn set_mint_amount(mint_amount: u64) {
        validate_owner();
        storage.mint_amount = mint_amount;
    }

    #[storage(read)]
    fn mint_coins(mint_amount: u64) {
        validate_owner();
        mint(mint_amount);
    }

    #[storage(read)]
    fn mint_and_transfer(amount: u64, recipient: Address) {
        let sender = get_msg_sender_address_or_panic();
        require(storage.owner == sender || (storage.reward_admins.get(sender).is_some() && storage.reward_admins.get(sender).unwrap()), Error::NotOwner);
        mint_to_address(amount, recipient);
    }

    #[storage(read)]
    fn burn_coins(burn_amount: u64) {
        validate_owner();
        burn(burn_amount);
    }

    #[storage(read)]
    fn transfer_coins(coins: u64, address: Address) {
        validate_owner();
        transfer_to_address(coins, contract_id(), address);
    }

    #[storage(read)]
    fn transfer_token_to_output(coins: u64, asset_id: ContractId, address: Address) {
        validate_owner();
        transfer_to_address(coins, asset_id, address);
    }

    //////////////////////////////////////
    // Mint public method
    //////////////////////////////////////
    #[storage(read, write)]
    fn mint() {
        require(storage.mint_amount > 0, Error::MintIsClosed);

        // Enable a address to mint only once
        let sender = get_msg_sender_address_or_panic();
        require(storage.mint_list.get(sender).is_none() || !storage.mint_list.get(sender).unwrap(), Error::AddressAlreadyMint);

        storage.mint_list.insert(sender, true);
        mint_to_address(storage.mint_amount, sender);
    }

    //////////////////////////////////////
    // Read-Only methods
    //////////////////////////////////////
    #[storage(read)]
    fn get_mint_amount() -> u64 {
        storage.mint_amount
    }

    fn get_balance() -> u64 {
        balance_of(contract_id(), contract_id())
    }

    fn get_token_balance(asset_id: ContractId) -> u64 {
        balance_of(asset_id, contract_id())
    }
    #[storage(read)]
    fn config() -> TokenInitializeConfig {
        storage.config
    }

    #[storage(read)]
    fn already_minted(address: Address) -> bool {
        return !storage.mint_list.get(address).is_none() && storage.mint_list.get(address).unwrap();
    }

    fn caller() -> Address {
        get_msg_sender_address_or_panic()
    }
}
