use crate::utils::{abi_calls::*, setup_utils::setup};
use fuels::prelude::*;

#[tokio::test]
async fn token_contract() {
    ////////////////////////////////////////////////////////
    //  Setup contracts and wallets
    ////////////////////////////////////////////////////////
    let (owner_token_istance, wallets) = setup().await;

    let token_name = name(&owner_token_istance).await.unwrap().value;
    let token_symbol = symbol(&owner_token_istance).await.unwrap().value;
    let token_decimals = decimals(&owner_token_istance).await.unwrap().value;
    println!(
        " 🪙  Token contract id: {}",
        owner_token_istance.get_contract_id()
    );
    println!(" 👮 Wallet owner     : {}", wallets.wallet_owner.address());
    println!(
        "\n ℹ️  Name: {token_name}\n ℹ️  Symbol: {token_symbol}\n ℹ️  Decimals: {token_decimals}"
    );
    let token_mint_amount = parse_units(10000, token_decimals); // Get the contract ID and a handle to it
    let wallet_token_amount = parse_units(1000, token_decimals); // Amount of tokens given to the wallet
    let asset_id = AssetId::from(*owner_token_istance.get_contract_id().hash());

    // Initialize contract
    initialize(
        &owner_token_istance,
        token_mint_amount,
        Address::from(wallets.wallet_owner.address()),
    )
    .await
    .unwrap();
    let mint_amount = get_mint_amount(&owner_token_istance).await.unwrap().value;
    println!(
        "\n✅ Initialize\n   Mint amount: {} {token_symbol}\n   Expected mint amount: {} {token_symbol}",
        format_units(mint_amount, token_decimals),
        format_units(token_mint_amount, token_decimals)
    );

    ////////////////////////////////////////////////////////
    // Test Token Contract
    ////////////////////////////////////////////////////////

    // Contract can be initialized only once
    let is_error = initialize(
        &owner_token_istance,
        token_mint_amount,
        Address::from(wallets.wallet_owner.address()),
    )
    .await
    .is_err();
    assert!(is_error);
    println!("\n✅ Contract can be initialized only once");

    // Verify the mint amount
    let mint_amount_contract = get_mint_amount(&owner_token_istance).await.unwrap();
    assert_eq!(mint_amount_contract.value, token_mint_amount);
    println!(
        "\n✅ Verify the mint amount\n   get_mint_amount result: {} {token_symbol}\n   token_mint_amount: {} {token_symbol}",
        format_units(mint_amount_contract.value, token_decimals), format_units(token_mint_amount, token_decimals)
    );

    // Verify update mint amount
    set_mint_amount(&owner_token_istance, parse_units(1, token_decimals))
        .await
        .unwrap();
    let mint_amount_contract = get_mint_amount(&owner_token_istance).await.unwrap();
    assert_eq!(mint_amount_contract.value, parse_units(1, token_decimals));
    println!(
        "\n✅ Verify update mint amount\n   get_mint_amount result: {} {token_symbol}\n   token_mint_amount: {} {token_symbol}",
        format_units(mint_amount_contract.value, token_decimals), 1
    );

    // Update mint amount to the original value
    set_mint_amount(&owner_token_istance, token_mint_amount)
        .await
        .unwrap();
    println!(
        "\n✅ Update mint amount to the original value: {} {token_symbol}",
        format_units(token_mint_amount, token_decimals)
    );

    // Mint some tokens
    mint_coins(&owner_token_istance, token_mint_amount)
        .await
        .unwrap();

    // Check the balance of the contract of its own asset
    let result = get_balance(&owner_token_istance).await.unwrap();
    assert_eq!(result.value, token_mint_amount);
    println!(
        "\n✅ Mint coins\n   get_balance result: {} {token_symbol}\n   token_mint_amount: {} {token_symbol}",
        format_units(token_mint_amount, token_decimals), format_units(result.value, token_decimals)
    );

    // Transfer tokens to the wallet
    let address = Address::from(wallets.wallet_owner.address());
    transfer_coins(&owner_token_istance, wallet_token_amount, address.clone())
        .await
        .unwrap();
    // Check the balance of the contract of its own asset
    let result = get_balance(&owner_token_istance).await.unwrap();
    let contract_balance = token_mint_amount - wallet_token_amount;
    let wallet_balance = wallets
        .wallet_owner
        .get_asset_balance(&asset_id)
        .await
        .unwrap();
    assert_eq!(result.value, contract_balance);
    println!(
        "\n✅ Transfer {} {token_symbol} to the wallet\n   Expected contract balance: {} {token_symbol}\n   Contract balance: {} {token_symbol}\n   Wallet balance: {} {token_symbol}",
        format_units(wallet_token_amount, token_decimals),
        format_units(contract_balance, token_decimals),
        format_units(result.value, token_decimals),
        format_units(wallet_balance, token_decimals),
    );

    // Burn all minted coins
    burn_coins(&owner_token_istance, contract_balance)
        .await
        .unwrap();

    // Check the balance of the contract of its own asset
    let result = get_balance(&owner_token_istance).await.unwrap();
    assert_eq!(result.value, 0);
    println!(
        "\n✅ Burn all minted coins\n   Minted amount: {} {token_symbol}",
        format_units(result.value,token_decimals),
    );
}

fn parse_units(num: u64, decimals: u8) -> u64 {
    num * 10u64.pow(decimals as u32)
}

fn format_units(num: u64, decimals: u8) -> u64 {
    num / 10u64.pow(decimals as u32)
}
