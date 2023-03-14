use fuels::tx::Address;

use crate::utils::cotracts_utils::limit_orders_utils::{
    limit_orders_interactions, LimitOrdersPredicate,
};
use crate::utils::cotracts_utils::token_utils::{token_abi_calls, TokenContract};
use crate::utils::{get_balance, local_tests_utils::*};

#[tokio::test]
async fn fulfill_order_test() {
    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = wallets[0].clone();
    let alice = wallets[1].clone();
    let alice_address = Address::from(alice.address());
    let bob = wallets[2].clone();
    let bob_address = Address::from(bob.address());
    let provider = alice.get_provider().unwrap();

    println!("alice_address = {:?}", alice_address);
    println!("bob_address = {:?}", bob_address);
    //--------------- TOKENS ---------------
    let assets = init_tokens(&admin).await;
    let usdc = assets.get("USDC").unwrap();
    let usdc_instance = TokenContract::new(usdc.contract_id.into(), admin.clone());
    let uni = assets.get("UNI").unwrap();
    let uni_instance = TokenContract::new(uni.contract_id.into(), admin.clone());

    let amount0 = 1000_000_000; //1000 USDC
    let amount1 = 200_000_000_000; // 200 UNI
    println!("asset0 = {:?}", usdc.asset_id.to_string());
    println!("amount0 = {:?}", amount0);
    println!("asset1 = {:?}", uni.asset_id.to_string());
    println!("amount1 = {:?}", amount1);

    token_abi_calls::mint_and_transfer(&usdc_instance, amount0, alice_address).await;
    token_abi_calls::mint_and_transfer(&uni_instance, amount1, bob_address).await;
    //--------------- PREDICATE ---------
    let predicate = LimitOrdersPredicate::load_from("./out/debug/limit_orders.bin").unwrap();

    // ==================== ALICE CREATES THE ORDER (TRANSFER) ====================
    // Alice transfer amount0 of  usdc.asset_id to the predicate root
    predicate
        .receive(&alice, amount0, usdc.asset_id, None)
        .await
        .unwrap();

    let initial_taker_offered_token_balance =
        get_balance(provider, bob.address(), usdc.asset_id).await;
    let initial_taker_asked_token_balance =
        get_balance(provider, bob.address(), uni.asset_id).await;
    let initial_receiver_balance = get_balance(provider, alice.address(), uni.asset_id).await;

    // The predicate root has received the coin
    assert_eq!(
        get_balance(provider, predicate.address(), usdc.asset_id).await,
        amount0
    );

    let _res = limit_orders_interactions::fulfill_order(
        &predicate,
        &bob,
        &alice_address,
        usdc.asset_id,
        amount0,
        uni.asset_id,
        amount1,
    )
    .await
    .unwrap();

    let predicate_balance = get_balance(provider, predicate.address(), usdc.asset_id).await;
    let taker_asked_token_balance = get_balance(provider, bob.address(), uni.asset_id).await;
    let taker_offered_token_balance = get_balance(provider, bob.address(), usdc.asset_id).await;
    let receiver_balance = get_balance(provider, &alice.address(), uni.asset_id).await;

    // The predicate root's coin has been spent
    assert_eq!(predicate_balance, 0);

    // Receiver has been paid `ask_amount`
    assert_eq!(receiver_balance, initial_receiver_balance + amount1);

    // Taker has sent `ask_amount` of the asked token and received `amount0` of the offered token in return
    assert_eq!(
        taker_asked_token_balance,
        initial_taker_asked_token_balance - amount1
    );
    assert_eq!(
        taker_offered_token_balance,
        initial_taker_offered_token_balance + amount0
    );
}
