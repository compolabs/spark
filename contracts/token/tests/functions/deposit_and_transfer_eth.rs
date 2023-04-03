use crate::utils::{abi_calls::*, setup_utils::setup};
use fuels::prelude::*;

#[tokio::test]
async fn deposit_and_transfer_eth() {
    ////////////////////////////////////////////////////////
    //  Setup contracts and wallets
    ////////////////////////////////////////////////////////
    let (owner_token_istance, wallets) = setup().await;

    println!(
        " 🪙  Token contract id: {}",
        owner_token_istance.get_contract_id()
    );
    println!(" 👮 Wallet owner     : {}", wallets.wallet_owner.address());

    let token_mint_amount = 10000; // Get the contract ID and a handle to it

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
    // Deposit and transfer ETH on the contract
    ////////////////////////////////////////////////////////

    let wallet_native_balance_before = wallets
        .wallet_owner
        .get_asset_balance(&BASE_ASSET_ID)
        .await
        .unwrap();
    let send_native_token_amount = 100;

    // Send native tokens to the contract
    let contract_native_token_balance = owner_token_istance
        .methods()
        .get_token_balance(ContractId::from(*BASE_ASSET_ID))
        .call_params(CallParameters::new(
            Some(send_native_token_amount),
            None,
            None,
        ))
        .call()
        .await
        .unwrap()
        .value;
    assert_eq!(contract_native_token_balance, send_native_token_amount);
    println!("\n✅ Send native tokens to the contract\n   Contract native token balance: {contract_native_token_balance}\n   Send native token amount: {send_native_token_amount}");

    // Check user balance didn't has the sent native tokens
    let wallet_native_balance_after = wallets
        .wallet_owner
        .get_asset_balance(&BASE_ASSET_ID)
        .await
        .unwrap();
    assert_eq!(
        wallet_native_balance_after,
        wallet_native_balance_before - send_native_token_amount
    );
    println!("\n✅ Check user balance didn't has the sent native tokens\n   Wallet native balance after: {wallet_native_balance_after}\n   Exepted wallet native balance: {}", wallet_native_balance_before - send_native_token_amount);

    // Transfer coins back to the wallet from the contract
    owner_token_istance
        .methods()
        .transfer_token_to_output(
            send_native_token_amount,
            ContractId::from(*BASE_ASSET_ID),
            Address::from(wallets.wallet_owner.address()),
        )
        .append_variable_outputs(1)
        .call()
        .await
        .unwrap();
    let wallet_native_balance_after = wallets
        .wallet_owner
        .get_asset_balance(&BASE_ASSET_ID)
        .await
        .unwrap();
    assert_eq!(wallet_native_balance_before, wallet_native_balance_after);
    println!("\n✅ Transfer coins back to the wallet from the contract\n   Wallet native balance before: {wallet_native_balance_before}\n   Wallet native balance after: {wallet_native_balance_after}");
}
