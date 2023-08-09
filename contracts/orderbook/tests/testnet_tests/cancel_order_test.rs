use std::{collections::HashMap, env, fs::read_to_string, str::FromStr};

use dotenv::dotenv;
use fuels::{
    accounts::wallet::WalletUnlocked,
    prelude::{abigen, Bech32ContractId, CallParameters, Provider, TxParameters, ViewOnlyAccount},
    types::{Address, AssetId, ContractId},
};
use serde::Deserialize;
use serde_json::from_str;

use src20_sdk::{token_abi_calls, TokenContract};

abigen!(Contract(
    name = "DApp",
    abi = "out/debug/orderbook-abi.json"
));

/*
0x..   =  0x376b233b1ac441b26dc030d9b16e24e1aa599eafac5cf385edc5d2eb5ae20e61
fuel.. = "fuel1xa4jxwc6c3qmymwqxrvmzm3yux49n84043w08p0dchfwkkhzpessx6p74h"
 */

const RPC: &str = "beta-3.fuel.network";
const CONTRACT_ADDRESS: &str = "0x376b233b1ac441b26dc030d9b16e24e1aa599eafac5cf385edc5d2eb5ae20e61";

#[derive(Deserialize)]
pub struct TokenConfig {
    symbol: String,
    // decimals: u8,
    asset_id: String,
}
pub struct Token {
    // decimals: u8,
    asset_id: AssetId,
    contract_id: ContractId,
    instance: TokenContract<WalletUnlocked>,
}
#[tokio::test]
async fn cancel_order_test() {
    dotenv().ok();

    //--------------- WALLETS ---------------
    let provider = Provider::connect(RPC).await.unwrap();

    let admin_pk = env::var("ADMIN").unwrap().parse().unwrap();
    let admin = WalletUnlocked::new_from_private_key(admin_pk, Some(provider.clone()));

    let alice_pk = env::var("ALICE").unwrap().parse().unwrap();
    let alice = WalletUnlocked::new_from_private_key(alice_pk, Some(provider.clone()));
    let alice_address = Address::from(alice.address());

    println!("alice_address = 0x{:?}\n", alice_address);
    //--------------- TOKENS ---------------
    let token_configs: Vec<TokenConfig> =
        from_str(&read_to_string("tests/artefacts/tokens.json").unwrap()).unwrap();
    let mut tokens: HashMap<String, Token> = HashMap::new();
    for config in token_configs {
        let contract_id: Bech32ContractId = ContractId::from_str(&config.asset_id).unwrap().into();
        tokens.insert(
            config.symbol.clone(),
            Token {
                instance: TokenContract::new(contract_id, admin.clone()),
                // decimals: config.decimals,
                asset_id: AssetId::from_str(&config.asset_id).unwrap(),
                contract_id: ContractId::from_str(&config.asset_id).unwrap(),
            },
        );
    }
    let usdc = tokens.get("USDC").unwrap();
    let uni = tokens.get("UNI").unwrap();

    let amount0 = 1000_000_000_u64; //1000 USDC
    let amount1 = 300_000_000_000_u64; //200 UNI
    println!("USDC AssetId (asset0) = 0x{:?}", usdc.asset_id);
    println!("UNI AssetId (asset1) = 0x{:?}", uni.asset_id);
    println!("amount0 = {:?} USDC", amount0 / 1000_000);
    println!("amount1 = {:?} UNI", amount1 / 1000_000_000);

    let initial_alice_usdc_balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    if initial_alice_usdc_balance < amount0 {
        token_abi_calls::mint(&usdc.instance, amount0, alice_address)
            .await
            .unwrap();
        println!("Alice minting {:?} USDC\n", amount0 / 1000_000);
    }
    // let initial_alice_usdc_balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    let contract_id: Bech32ContractId = ContractId::from_str(CONTRACT_ADDRESS).unwrap().into();
    let instance = DApp::new(contract_id, alice.clone());
    let deposit = instance
        .methods()
        .get_deposit(alice_address)
        .simulate()
        .await
        .unwrap()
        .value;

    if deposit < 1000 {
        instance
            .methods()
            .deposit()
            .tx_params(TxParameters::default().set_gas_price(1))
            .call_params(CallParameters::default().set_amount(1000))
            .unwrap()
            .call()
            .await
            .unwrap();
    }
    let order_id = instance
        .methods()
        .create_order(uni.contract_id, amount1, 1000)
        .tx_params(TxParameters::default().set_gas_price(1))
        .call_params(
            CallParameters::default()
                .set_amount(amount0)
                .set_asset_id(usdc.asset_id),
        )
        .unwrap()
        .call()
        .await
        .unwrap()
        .value;

    instance
        .methods()
        .cancel_order(order_id)
        .tx_params(TxParameters::default().set_gas_price(1))
        .append_variable_outputs(1)
        .call()
        .await
        .unwrap();
}
