use std::collections::HashMap;

use fuels::tx::Address;

use crate::utils::cotracts_utils::limit_orders_utils::{
    limit_orders_interactions, LimitOrdersPredicate,
};
use crate::utils::cotracts_utils::token_utils::{token_abi_calls, TokenContract};
use crate::utils::{get_balance, local_tests_utils::*, print_title};

// Alice wants to exchange 1000 USDC for 200 UNI
// Bob wants to exchange 200 UNI for 1000 USDC

#[tokio::test]
async fn cancel_order_test() {
    print_title("Cancel Order Test");
    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = wallets[0].clone();
    let alice = wallets[1].clone();
    let alice_address = Address::from(alice.address());
    let provider = alice.get_provider().unwrap();

    println!("alice_address = {:?}", alice_address);
    println!("");
    //--------------- TOKENS ---------------
    let assets = init_tokens(&admin).await;
    let usdc = assets.get("USDC").unwrap();
    let usdc_instance = TokenContract::new(usdc.contract_id.into(), admin.clone());
    let uni = assets.get("UNI").unwrap();

    let amount0 = 1000_000_000_u64; //1000 USDC
    let amount1 = 200_000_000_000_u64; //200 UNI
    println!("USDC AssetId (asset0) = {:?}", usdc.asset_id.to_string());
    println!("UNI AssetId (asset1) = {:?}", uni.asset_id.to_string());
    println!("amount0 = {:?} USDC", amount0 / 1000_000);
    println!("amount1 = {:?} UNI", amount1 / 1000_000_000);
    println!("");

    token_abi_calls::mint_and_transfer(&usdc_instance, amount0, alice_address).await;
    let initial_alice_usdc_balance = get_balance(provider, alice.address(), usdc.asset_id).await;

    println!("Alice minting {:?} USDC", amount0 / 1000_000);
    println!("");
    //--------------- PREDICATE ---------
    let mut req = HashMap::new();
    req.insert("asset0", format!("0x{}", usdc.asset_id.to_string()));
    req.insert("amount0", amount0.to_string());
    req.insert("asset1", format!("0x{}", uni.asset_id.to_string()));
    req.insert("amount1", amount1.to_string());
    req.insert("owner", format!("0x{}", alice.address().hash().to_string()));

    println!("Backend Request Json = {:?}", req);
    println!("");

    let client = reqwest::Client::new();
    let res = client
        .post("http://localhost:8080/create")
        .json(&req)
        .send()
        .await
        .unwrap();
    let raw_code = res.text().await.unwrap();

    println!("Backend Response = {:?}...]", &raw_code[..50]);
    println!("");

    let code: serde_json::Value = serde_json::from_str(&raw_code).unwrap();
    let code: Vec<u8> = code
        .as_str()
        .unwrap()
        .split(',')
        .map(|b| b.replace("[", "").replace("]", "").parse::<u8>().unwrap())
        .collect();

    let predicate = LimitOrdersPredicate::new(code);

    //--------------- THE TEST ---------
    predicate
        .receive(&alice, amount0, usdc.asset_id, None)
        .await
        .unwrap();

    println!("Alice transfers 1000 USDC to predicate\n");

    let _res = limit_orders_interactions::cancel_order(&predicate, &alice, usdc.asset_id, amount0)
        .await
        .unwrap();

    println!("Alice canceles the order\n");
    // The predicate root's coin has been spent
    let predicate_balance = get_balance(provider, predicate.address(), usdc.asset_id).await;
    assert_eq!(predicate_balance, 0);

    // Wallet balance is the same as before it sent the coins to the predicate
    let wallet_balance = get_balance(provider, alice.address(), usdc.asset_id).await;
    assert_eq!(wallet_balance, initial_alice_usdc_balance);
    println!("Alice balance 1000 UDSC\n");
}

// return;
