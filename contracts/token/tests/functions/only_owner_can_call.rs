use crate::utils::{
    abi_calls::*,
    setup_utils::{get_token_instance, setup},
};
use fuels::prelude::*;

#[tokio::test]
async fn only_owner_can_call() {
    ////////////////////////////////////////////////////////
    //  Setup contracts and wallets
    ////////////////////////////////////////////////////////
    let (owner_token_istance, wallets) = setup().await;

    println!(
        " 🪙  Token contract id: {}",
        owner_token_istance.get_contract_id()
    );
    println!(" 👮 Wallet owner     : {}", wallets.wallet_owner.address());
    println!(" 👨 Wallet 1     : {}", wallets.wallet1.address());
    println!(" 👩 Wallet 2     : {}", wallets.wallet2.address());

    // Get the contract ID and a handle to it
    let token_mint_amount = 10000;

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

    ////////////////////////////////////////////////////////
    // Check only owner can call contract
    ////////////////////////////////////////////////////////

    let wallet1_token_instance =
        get_token_instance(owner_token_istance.get_contract_id(), &wallets.wallet1);

    let is_error = burn_coins(&wallet1_token_instance, 1).await.is_err();
    assert!(is_error);
    println!("\n✅ Wallet 1 cannot burn_coins");

    let is_error = mint_coins(&wallet1_token_instance, 1).await.is_err();
    assert!(is_error);
    println!("\n✅ Wallet 1 cannot mint_coins");

    let is_error = set_mint_amount(&wallet1_token_instance, 1).await.is_err();
    assert!(is_error);
    println!("\n✅ Wallet 1 cannot set_mint_amount");

    let is_error = transfer_token_to_output(
        &wallet1_token_instance,
        1,
        ContractId::from(*owner_token_istance.get_contract_id().hash()),
        Address::from(wallets.wallet2.address()),
    )
    .await
    .is_err();
    assert!(is_error);
    println!("\n✅ Wallet 1 cannot transfer_token_to_output");
}
