use fuels::tx::Address;

use crate::utils::cotracts_utils::limit_orders_utils::{
    limit_orders_interactions, LimitOrdersPredicate,
};
use crate::utils::cotracts_utils::token_utils::{token_abi_calls, TokenContract};
use crate::utils::{get_balance, local_tests_utils::*};

#[tokio::test]
async fn cancel_order_test() {
    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = wallets[0].clone();
    let alice = wallets[1].clone();
    let alice_address = Address::from(alice.address());

    let provider = alice.get_provider().unwrap();
    //--------------- TOKENS ---------------
    let assets = init_tokens(&admin).await;
    let usdc = assets.get("USDC").unwrap();
    let usdc_instance = TokenContract::new(usdc.contract_id.into(), admin.clone());
    // let uni = assets.get("UNI").unwrap();

    let amount0 = 1000_000_000; //1000 USDC
    token_abi_calls::mint_and_transfer(&usdc_instance, amount0, alice_address).await;
    let initial_alice_usdc_balance = get_balance(provider, alice.address(), usdc.asset_id).await;

    //--------------- THE TEST ---------
    let predicate = LimitOrdersPredicate::load_from("./out/debug/limit_orders.bin").unwrap();
    predicate
        .receive(&alice, amount0, usdc.asset_id, None)
        .await
        .unwrap();

    let _res = limit_orders_interactions::cancel_order(&predicate, &alice, usdc.asset_id, amount0)
        .await
        .unwrap();

    // The predicate root's coin has been spent
    let predicate_balance = get_balance(provider, predicate.address(), usdc.asset_id).await;
    assert_eq!(predicate_balance, 0);

    // Wallet balance is the same as before it sent the coins to the predicate
    let wallet_balance = get_balance(provider, alice.address(), usdc.asset_id).await;
    assert_eq!(wallet_balance, initial_alice_usdc_balance);
}
