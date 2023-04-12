use std::collections::HashMap;

use fuels::accounts::predicate::Predicate;
use fuels::prelude::ViewOnlyAccount;
use fuels::tx::Address;

use crate::utils::cotracts_utils::limit_orders_utils::limit_orders_interactions::{
    build_predicate, create_order, fulfill_order,
};
use crate::utils::cotracts_utils::token_utils::{token_abi_calls, TokenContract};
use crate::utils::{get_balance, local_tests_utils::*, print_title};

// Alice wants to exchange 1000 USDC for 200 UNI
// Bob wants to exchange 200 UNI for 1000 USDC

#[tokio::test]
async fn fulfill_order_test() {
    print_title("Fulfill Order Test");
    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = wallets[0].clone();
    let alice = wallets[1].clone();
    let alice_address = Address::from(alice.address());
    let bob = wallets[2].clone();
    let bob_address = Address::from(bob.address());
    let provider = alice.provider().unwrap();

    println!("alice_address = {:?}", alice_address);
    println!("bob_address = {:?}", bob_address);
    println!("");
    //--------------- TOKENS ---------------
    let assets = init_tokens(&admin).await;
    let usdc = assets.get("USDC").unwrap();
    let usdc_instance = TokenContract::new(usdc.contract_id.into(), admin.clone());
    let uni = assets.get("UNI").unwrap();
    let uni_instance = TokenContract::new(uni.contract_id.into(), admin.clone());

    let amount0 = 1_000_000_000; //1000 USDC
    let amount1 = 200_000_000_000; // 200 UNI
    println!("USDC AssetId (asset0) = {:?}", usdc.asset_id.to_string());
    println!("UNI AssetId (asset1) = {:?}", uni.asset_id.to_string());
    println!("amount0 = {:?} USDC", amount0 / 1_000_000);
    println!("amount1 = {:?} UNI", amount1 / 1_000_000_000);
    println!("");

    token_abi_calls::mint_and_transfer(&usdc_instance, amount0, alice_address).await;
    token_abi_calls::mint_and_transfer(&uni_instance, amount1, bob_address).await;

    println!("Alice minting {:?} USDC", amount0 / 1_000_000);
    println!("Bob minting {:?} UNI", amount1 / 1_000_000_000);
    println!("");
    //--------------- PREDICATE ---------
    let mut req = HashMap::new();
    req.insert("asset0", format!("0x{}", usdc.asset_id.to_string()));
    req.insert("amount0", amount0.to_string());
    req.insert("asset1", format!("0x{}", uni.asset_id.to_string()));
    req.insert("amount1", amount1.to_string());
    req.insert("owner", format!("0x{}", alice.address().hash().to_string()));
    println!("Backend Request Json = {:?}\n", req);

    let (id, code) = build_predicate(req).await;
    println!("Backend Response = id:{id}, code:{:?}...]\n", &code[..20]);

    let predicate: Predicate =
        Predicate::from_code(code.clone().into()).with_provider(alice.provider().unwrap().clone());

    // ==================== ALICE CREATES THE ORDER (TRANSFER) ====================
    // Alice transfer amount0 of  usdc.asset_id to the predicate root
    assert!(alice.get_asset_balance(&usdc.asset_id).await.unwrap() == amount0);
    let receipts = create_order(
        &alice,
        id,
        &predicate,
        &usdc_instance,
        amount0,
        &uni_instance,
        amount1,
    )
    .await;
    // dbg!(&receipts);
    let _receipts = receipts.unwrap();
    // println!(
    //     "logs =  {:?}",
    //     receipts.get_logs_with_type::<CreateOrderParams>().unwrap()
    // );

    let initial_bob_usdc_balance = get_balance(provider, bob.address(), usdc.asset_id).await;
    let initial_bob_uni_balance = get_balance(provider, bob.address(), uni.asset_id).await;
    let initial_alice_uni_balance = get_balance(provider, alice.address(), uni.asset_id).await;

    // The predicate root has received the coin
    let predicate_usdc_balance = get_balance(provider, predicate.address(), usdc.asset_id).await;
    assert_eq!(predicate_usdc_balance, amount0);

    println!("Alice transfers 1000 USDC to predicate\n");

    let _res = fulfill_order(
        &predicate,
        code.clone(),
        &bob,
        &alice_address,
        usdc.asset_id,
        amount0,
        uni.asset_id,
        amount1,
    )
    .await
    .unwrap();

    println!("Bob transfers 200 UNI to predicate, thus closing the order\n");

    let predicate_balance = get_balance(provider, predicate.address(), usdc.asset_id).await;
    let bob_uni_balance = get_balance(provider, bob.address(), uni.asset_id).await;
    let bob_usdc_balance = get_balance(provider, bob.address(), usdc.asset_id).await;
    let alice_uni_balance = get_balance(provider, &alice.address(), uni.asset_id).await;

    // The predicate root's coin has been spent
    assert_eq!(predicate_balance, 0);

    // Receiver has been paid `ask_amount`
    assert_eq!(alice_uni_balance, initial_alice_uni_balance + amount1);

    // Taker has sent `ask_amount` of the asked token and received `amount0` of the offered token in return
    assert_eq!(bob_uni_balance, initial_bob_uni_balance - amount1);
    assert_eq!(bob_usdc_balance, initial_bob_usdc_balance + amount0);

    println!("Alice balance 200 UNI");
    println!("Bob balance 1000 USDC\n\n");
}
