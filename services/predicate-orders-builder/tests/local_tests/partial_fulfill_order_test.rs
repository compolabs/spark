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
async fn partial_fulfill_order_test() {
    print_title("Partial fulfill Order Test");
    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = wallets[0].clone();
    let alice = wallets[1].clone();
    let alice_address = Address::from(alice.address());
    let bob = wallets[2].clone();
    let bob_address = Address::from(bob.address());
    let provider = alice.provider().unwrap();

    println!("admin_address = {:?}", alice_address);
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
    println!(
        "Alice  balances = {:#?}",
        provider.get_balances(alice.address()).await.unwrap()
    );
    println!(
        "Bob  balances = {:#?}",
        provider.get_balances(bob.address()).await.unwrap()
    );

    println!("Alice minting {:?} USDC", amount0 / 1_000_000);
    println!("Bob minting {:?} UNI", amount1 / 1_000_000_000);
    println!("");
    //--------------- PREDICATEЫ ---------
    let mut req = HashMap::new();
    req.insert("asset0", format!("0x{}", usdc.asset_id.to_string()));
    req.insert("amount0", amount0.to_string());
    req.insert("asset1", format!("0x{}", uni.asset_id.to_string()));
    req.insert("amount1", amount1.to_string());
    req.insert("owner", format!("0x{}", alice.address().hash().to_string()));
    println!("Base predicate backend request JSON = {:?}\n", req);

    let (id, base_predicate_code) = build_predicate(req).await;
    println!(
        "Base predicate backend response = id:{id}, code:{:?}...]\n",
        &base_predicate_code[..20]
    );

    let base_predicate: Predicate = Predicate::from_code(base_predicate_code.clone().into())
        .with_provider(alice.provider().unwrap().clone());

    let mut req = HashMap::new();
    req.insert("asset0", format!("0x{}", usdc.asset_id.to_string()));
    req.insert("amount0", amount0.to_string());
    req.insert("asset1", format!("0x{}", uni.asset_id.to_string()));
    req.insert("amount1", amount1.to_string());
    req.insert("owner", format!("0x{}", alice.address().hash().to_string()));
    println!("New predicate backend request JSON = {:?}\n", req);

    let (id, new_predicate_code) = build_predicate(req).await;
    println!(
        "New predicate backend response = id:{id}, code:{:?}...]\n",
        &new_predicate_code[..20]
    );

    let new_predicate: Predicate = Predicate::from_code(new_predicate_code.clone().into())
        .with_provider(alice.provider().unwrap().clone());

    // ==================== ALICE CREATES THE ORDER (TRANSFER) ====================
    // Alice transfer amount0 of  usdc.asset_id to the predicate root
    assert!(alice.get_asset_balance(&usdc.asset_id).await.unwrap() == amount0);
    let receipts = create_order(
        &alice,
        id,
        &base_predicate,
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
    let predicate_usdc_balance =
        get_balance(provider, base_predicate.address(), usdc.asset_id).await;
    assert_eq!(predicate_usdc_balance, amount0);

    println!("Alice transfers 1000 USDC to base predicate\n");

    let _res = fulfill_order(
        (&base_predicate, base_predicate_code.clone()),
        Option::Some((&new_predicate, new_predicate_code.clone(), amount0)),
        &bob,
        &alice_address,
        usdc.asset_id,
        amount0 / 2,
        uni.asset_id,
        amount1 / 2,
    )
    .await
    .unwrap();
    // The predicate root has received the coin
    println!("Bob transfers 100 UNI to base predicate, thus closing the order\n");
    let predicate_usdc_balance =
        get_balance(provider, new_predicate.address(), usdc.asset_id).await;
    assert_eq!(predicate_usdc_balance, amount0 / 2);

    let _res = fulfill_order(
        (&new_predicate, new_predicate_code.clone()),
        Option::None,
        &bob,
        &alice_address,
        usdc.asset_id,
        amount0 / 2,
        uni.asset_id,
        amount1 / 2,
    )
    .await
    .unwrap();
    println!("Bob transfers another 100 UNI to new predicate, thus closing the order\n");

    let base_predicate_balance =
        get_balance(provider, base_predicate.address(), usdc.asset_id).await;
    let new_predicate_balance = get_balance(provider, new_predicate.address(), usdc.asset_id).await;
    let bob_uni_balance = get_balance(provider, bob.address(), uni.asset_id).await;
    let bob_usdc_balance = get_balance(provider, bob.address(), usdc.asset_id).await;
    let alice_uni_balance = get_balance(provider, &alice.address(), uni.asset_id).await;

    // The predicate root's coin has been spent
    assert_eq!(base_predicate_balance, 0);
    assert_eq!(new_predicate_balance, 0);

    // Receiver has been paid `ask_amount`
    assert_eq!(alice_uni_balance, initial_alice_uni_balance + amount1);

    // Taker has sent `ask_amount` of the asked token and received `amount0` of the offered token in return
    assert_eq!(bob_uni_balance, initial_bob_uni_balance - amount1);
    assert_eq!(bob_usdc_balance, initial_bob_usdc_balance + amount0);

    println!("Alice balance 200 UNI");
    println!("Bob balance 1000 USDC\n\n");
}
