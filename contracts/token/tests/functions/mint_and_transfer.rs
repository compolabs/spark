use crate::utils::{
    abi_calls::*,
    setup_utils::{get_token_instance, setup},
};
use fuels::prelude::*;

#[tokio::test]
async fn mint_and_transfer() {
    ////////////////////////////////////////////////////////
    //  Setup contracts and wallets
    ////////////////////////////////////////////////////////
    let (owner_token_istance, wallets) = setup().await;

    println!(
        " 🪙  Token contract id: {}",
        owner_token_istance.get_contract_id()
    );
    println!(" 👮 Wallet owner     : {}", wallets.wallet_owner.address());
    println!(" 👨 Wallet mint1     : {}", wallets.wallet1.address());
    println!(" 👩 Wallet mint2     : {}", wallets.wallet2.address());

    ////////////////////////////////////////////////////////
    // Test mint and transfer to address
    ////////////////////////////////////////////////////////

    let token_mint_amount = 10000; // Get the contract ID and a handle to it
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
    let balance = get_balance(&owner_token_istance).await.unwrap().value;
    println!(
        "\n✅ Initialize\n   Mint amount: {mint_amount}\n   Token Contract balance: {balance}"
    );

    let wallet1_token_instance =
        get_token_instance(owner_token_istance.get_contract_id(), &wallets.wallet1);

    // Mint and transfer some alt tokens to the wallet1
    mint(&wallet1_token_instance).await.unwrap();

    let wallet1_balance = wallets.wallet1.get_asset_balance(&asset_id).await.unwrap();
    assert_eq!(wallet1_balance, token_mint_amount);
    println!("\n✅ Mint and transfer {token_mint_amount} tokens to the wallet1\n   Wallet1 balance: {wallet1_balance}");

    // Mint can be called only once
    let is_error = mint(&wallet1_token_instance).await.is_err();
    assert!(is_error);
    println!("\n✅  Mint can be called only once");

    // Wallet should be able to mint tokens
    let wallet2_token_instance =
        get_token_instance(owner_token_istance.get_contract_id(), &wallets.wallet2);

    // Mint and transfer some alt tokens to the wallet2
    mint(&wallet2_token_instance).await.unwrap();

    let wallet2_balance = wallets.wallet1.get_asset_balance(&asset_id).await.unwrap();
    assert_eq!(wallet2_balance, token_mint_amount);
    println!("\n✅ Mint and transfer {token_mint_amount} tokens to the wallet2\n   Wallet2 balance: {wallet1_balance}");

    // As we mint and transfer the contract balance should be 0
    let result = get_balance(&owner_token_istance).await.unwrap();
    assert_eq!(result.value, 0);
    println!("\n✅ As we mint and transfer the token contract balance should be 0\n   Token contract balance: {}", result.value);
}
