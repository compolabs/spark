use std::{collections::HashMap, str::FromStr};

use fuels::{
    accounts::{fuel_crypto::SecretKey, predicate::Predicate},
    prelude::{Bech32ContractId, Provider, WalletUnlocked},
    types::{AssetId, ContractId},
};

use crate::utils::cotracts_utils::{
    limit_orders_utils::limit_orders_interactions::{build_predicate, create_order, fulfill_order},
    token_utils::{token_abi_calls, TokenContract},
};

const RPC: &str = "beta-3.fuel.network";

#[tokio::test]
async fn test() {
    let provider = Provider::connect(RPC).await.unwrap();
    let tx = provider
        .get_transaction_by_id("0x4f450ea1414a0f9b435b6280bb81d28f9c0b8295ff07979124061334b8b64110")
        .await
        .unwrap()
        .unwrap();
    println!("tx = {:?}", tx.clone());
}

#[tokio::test]
async fn main_test() {
    let provider = Provider::connect(RPC).await.unwrap();

    dotenv::dotenv().ok();
    //--------------- WALLETS ---------------
    let admin_secret: SecretKey = std::env::var("ADMIN").unwrap().parse().unwrap();
    let alice_secret: SecretKey = std::env::var("ALICE").unwrap().parse().unwrap();
    let bob_secret: SecretKey = std::env::var("BOB").unwrap().parse().unwrap();
    let admin = WalletUnlocked::new_from_private_key(admin_secret, Some(provider.clone()));
    let alice = WalletUnlocked::new_from_private_key(alice_secret, Some(provider.clone()));
    let bob = WalletUnlocked::new_from_private_key(bob_secret, Some(provider.clone()));
    //--------------- TOKENS ---------------
    let json_str = std::fs::read_to_string("tests/tokens.json").unwrap();
    let token_configs: serde_json::Value = serde_json::from_str(json_str.as_str()).unwrap();
    let token_configs = token_configs.as_array().unwrap();
    let mut assets: HashMap<String, TokenContract<WalletUnlocked>> = HashMap::new();
    for config in token_configs {
        let asset_id_str = config["asset_id"].as_str().unwrap();
        let contract_id: Bech32ContractId = ContractId::from_str(asset_id_str).unwrap().into();
        let instance = TokenContract::new(contract_id, admin.clone());
        assets.insert(String::from(config["symbol"].as_str().unwrap()), instance);
    }
    let usdc = assets.get("USDC").unwrap();
    let uni = assets.get("UNI").unwrap();

    let amount0: u64 = 1_000_000_000; //1000 USDC
    let amount1: u64 = 200_000_000_000; // 200 UNI

    token_abi_calls::mint_and_transfer(&usdc, amount0, alice.address().into()).await;
    token_abi_calls::mint_and_transfer(&uni, amount1, bob.address().into()).await;
    //--------------- PREDICATE ---------
    let mut req = HashMap::new();
    req.insert("asset0", format!("0x{}", usdc.contract_id().hash));
    req.insert("amount0", amount0.to_string());
    req.insert("asset1", format!("0x{}", uni.contract_id().hash));
    req.insert("amount1", amount1.to_string());
    req.insert("owner", format!("0x{}", alice.address().hash));
    println!("Backend Request Json = {:?}\n", req);

    let (id, code) = build_predicate(req).await;

    let predicate: Predicate = Predicate::from_code(code.clone().into());

    let receipts = create_order(&alice, id, &predicate, &usdc, amount0, &uni, amount1).await;
    dbg!(&receipts);
    let _receipts = receipts.unwrap();
    // println!(
    //     "logs =  {:?}",
    //     receipts.get_logs_with_type::<CreateOrderParams>().unwrap()
    // );

    

    let receipts = fulfill_order(
        &predicate,
        code.clone(),
        &bob,
        &alice.address().into(),
        AssetId::from(*usdc.contract_id().hash()),
        amount0,
        AssetId::from(*uni.contract_id().hash()),
        amount1,
    )
    .await;

    dbg!(&receipts);
    receipts.unwrap();
}
