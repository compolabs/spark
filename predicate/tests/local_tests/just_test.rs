use fuels::core::abi_encoder::UnresolvedBytes;
use fuels::prelude::{abigen, SettableContract, TxParameters};
use fuels::programs::script_calls::ScriptCallHandler;
use fuels::tx::Address;

use crate::utils::cotracts_utils::token_utils::{token_abi_calls, TokenContract};
use crate::utils::{get_balance, local_tests_utils::*};
abigen!(Predicate(
    name = "LimitOrdersPredicate",
    abi = "out/debug/limit_orders-abi.json"
));
#[tokio::test]
async fn just_test() {
    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = wallets[0].clone();
    let alice = wallets[1].clone();
    let alice_address = Address::from(alice.address());
    let bob = wallets[2].clone();
    let bob_address = Address::from(bob.address());
    let provider = alice.get_provider().unwrap();
    //--------------- TOKENS ---------------
    let assets = init_tokens(&admin).await;
    let usdc = assets.get("USDC").unwrap();
    let usdc_instance = TokenContract::new(usdc.contract_id.into(), admin.clone());
    let uni = assets.get("UNI").unwrap();
    let uni_instance = TokenContract::new(uni.contract_id.into(), admin.clone());

    let amount0 = 1000_000_000; //1000 USDC
    let amount1 = 200_000_000_000; // 200 UNI

    token_abi_calls::mint_and_transfer(&usdc_instance, amount0, alice_address).await;
    token_abi_calls::mint_and_transfer(&uni_instance, amount1, bob_address).await;
    //--------------- PREDICATE ---------
    // let predicate = LimitOrdersPredicate::new(admin.clone(), "./out/debug/limit_orders.bin");
    let predicate = LimitOrdersPredicate::load_from("./out/debug/limit_orders.bin").unwrap();
    let _result = alice
        .transfer(
            predicate.address(),
            amount0,
            usdc.asset_id,
            TxParameters::default(),
        )
        .await
        .unwrap();

    // Check predicate balance.
    let balance = get_balance(provider, predicate.address(), usdc.asset_id).await;
    assert_eq!(balance, amount0);

    let predicate_data = predicate.encode_data(42_u64);

    let amount_to_unlock = 500;

    let _result = second_wallet
        .spend_predicate(
            predicate_address,
            predicate_code,
            amount_to_unlock,
            AssetId::default(),
            second_wallet.address(),
            Some(predicate_data),
            TxParameters::default(),
        )
        .await?;

    // Predicate balance is zero.
    let balance = first_wallet
        .get_provider()?
        .get_asset_balance(predicate_address, AssetId::default())
        .await?;

    assert_eq!(balance, 0);

    // Second wallet balance is updated.
    let balance = second_wallet.get_asset_balance(&AssetId::default()).await?;
    assert_eq!(balance, 1500);



    // ==================== ALICE CREATES THE OR;ER (TRANSFER) ====================
    // Alice transfer amount0 of  usdc.asset_id to the predicate root
    // predicate
    //     .receive(&alice, amount0, usdc.asset_id, None)
    //     .await
    //     .unwrap();

    // let initial_taker_offered_token_balance =
    //     get_balance(provider, bob.address(), usdc.asset_id).await;
    // let initial_taker_asked_token_balance =
    //     get_balance(provider, bob.address(), uni.asset_id).await;
    // let initial_receiver_balance = get_balance(provider, alice.address(), uni.asset_id).await;

    // // The predicate root has received the coin
    // assert_eq!(
    //     get_balance(provider, predicate.address(), usdc.asset_id).await,
    //     amount0
    // );

    // let _res = limit_orders_interactions::fulfill_order(
    //     &predicate,
    //     &bob,
    //     &alice_address,
    //     usdc.asset_id,
    //     amount0,
    //     uni.asset_id,
    //     amount1,
    // )
    // .await
    // .unwrap();

    // let predicate_balance = get_balance(provider, predicate.address(), usdc.asset_id).await;
    // let taker_asked_token_balance = get_balance(provider, bob.address(), uni.asset_id).await;
    // let taker_offered_token_balance = get_balance(provider, bob.address(), usdc.asset_id).await;
    // let receiver_balance = get_balance(provider, &alice.address(), uni.asset_id).await;

    // // The predicate root's coin has been spent
    // assert_eq!(predicate_balance, 0);

    // // Receiver has been paid `ask_amount`
    // assert_eq!(receiver_balance, initial_receiver_balance + amount1);

    // // Taker has sent `ask_amount` of the asked token and received `amount0` of the offered token in return
    // assert_eq!(
    //     taker_asked_token_balance,
    //     initial_taker_asked_token_balance - amount1
    // );
    // assert_eq!(
    //     taker_offered_token_balance,
    //     initial_taker_offered_token_balance + amount0
    // );
}
