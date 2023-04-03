use std::collections::HashMap;

use fuels::prelude::{abigen, TxParameters};
use fuels::tx::Address;

use crate::utils::cotracts_utils::limit_orders_utils::{
    limit_orders_interactions, LimitOrdersPredicate,
};
use crate::utils::cotracts_utils::token_utils::{token_abi_calls, TokenContract};
use crate::utils::local_tests_utils::scripts::transaction_inputs_outputs;
use crate::utils::{get_balance, local_tests_utils::*, print_title};

// Alice wants to exchange 1000 USDC for 200 UNI
// Bob wants to exchange 200 UNI for 1000 USDC
abigen!(Script(
    name = "Script",
    abi = "create_order_script/out/debug/create_order_script-abi.json"
));
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
    let provider = alice.get_provider().unwrap();

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

    // ==================== ALICE CREATES THE ORDER (TRANSFER) ====================
    // Alice transfer amount0 of  usdc.asset_id to the predicate root
    assert!(alice.get_asset_balance(&usdc.asset_id).await.unwrap() == amount0);
    let bin_path = "create_order_script/out/debug/create_order_script.bin";
    let instance = Script::new(alice.clone(), bin_path);

    let assets = vec![usdc.asset_id];
    let transaction_parameters =
        transaction_inputs_outputs(&alice, &provider, &assets, Some(&vec![amount0])).await;

    instance
        .main(amount0, usdc.contract_id, predicate.address().into())
        .tx_params(TxParameters::default().set_gas_price(1))
        .with_inputs(transaction_parameters.inputs)
        .with_outputs(transaction_parameters.outputs)
        .call()
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

    println!("Alice transfers 1000 USDC to predicate\n");

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

    println!("Bob transfers 200 UNI to predicate, thus closing the order\n");

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

    println!("Alice balance 200 UNI");
    println!("Bob balance 1000 USDC\n\n");
}
