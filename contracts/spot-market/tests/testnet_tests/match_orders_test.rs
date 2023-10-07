use dotenv::dotenv;
use fuels::programs::call_utils::TxDependencyExtension;
use fuels::{
    accounts::wallet::WalletUnlocked,
    prelude::{abigen, Bech32ContractId, CallParameters, Provider, TxParameters, ViewOnlyAccount},
    types::{Address, ContractId},
};
use std::{env, str::FromStr};

use crate::utils::contracts_utils::token_utils::load_tokens;
use crate::utils::print_title;

abigen!(Contract(
    name = "DApp",
    abi = "out/debug/spot-market-abi.json"
));

const RPC: &str = "beta-4.fuel.network";
const CONTRACT_ADDRESS: &str = "0x6082a82891e2f9c9154189b84b0e1ac63b828ae3a63e896e086ad5ebb34df5da";

const ASSET0: &str = "USDC";
const AMOUNT0: u64 = 1000;

const ASSET1: &str = "UNI";
const AMOUNT1: u64 = 300;

#[tokio::test]
async fn match_orders_test() {
    print_title("Match order");
    dotenv().ok();
    
    //--------------- WALLETS ---------------
    let provider = Provider::connect(RPC).await.unwrap();

    // let admin_pk = env::var("ADMIN").unwrap().parse().unwrap();
    // let admin = WalletUnlocked::new_from_private_key(admin_pk, Some(provider.clone()));

    let alice_pk = env::var("ALICE").unwrap().parse().unwrap();
    let alice = WalletUnlocked::new_from_private_key(alice_pk, Some(provider.clone()));
    let alice_address = Address::from(alice.address());

    println!("alice_address = 0x{:?}\n", alice_address);
    //--------------- TOKENS ---------------
    let tokens = load_tokens("tests/artefacts/tokens.json").await;
    let asset0 = tokens.get(ASSET0).unwrap();
    let asset1 = tokens.get(ASSET1).unwrap();
    let asset0_precision = 10u64.pow(asset0.decimals as u32);
    let asset1_precision = 10u64.pow(asset1.decimals as u32);

    let amount0 = AMOUNT0 * asset0_precision; //1000 USDC
    let amount1 = AMOUNT1 * asset1_precision; //200 UNI
    println!("asset0: {} = 0x{:?}", asset0.symbol, asset0.asset_id);
    println!("asset1: {} = 0x{:?}", asset1.symbol, asset1.asset_id);
    println!("amount0 = {} {}", amount0 / asset0_precision, asset0.symbol);
    println!("amount1 = {} {}", amount1 / asset1_precision, asset1.symbol);

    // let initial_alice_usdc_balance = alice.get_asset_balance(&asset0.asset_id).await.unwrap();
    // if initial_alice_usdc_balance < amount0 {
    //     token_abi_calls::mint(&asset0.instance, amount0, alice_address)
    //         .await
    //         .unwrap();
    //     println!("Alice + {} {}\n", amount0 / asset0_precision, asset0.symbol);
    // }
    // let initial_alice_usdc_balance = alice.get_asset_balance(&asset0.asset_id).await.unwrap();
    let contract_id: Bech32ContractId = ContractId::from_str(CONTRACT_ADDRESS).unwrap().into();
    let instance = DApp::new(contract_id, alice.clone());
    let methods = instance.methods();
    // println!(
    //     "{:#?}",
    //     methods.order_by_id(1).simulate().await.unwrap().value
    // );
    // println!(
    //     "{:#?}",
    //     methods.order_by_id(2).simulate().await.unwrap().value
    // );
    //     methods
    //     .match_orders(1, 2)
    //     .tx_params(TxParameters::default().with_gas_price(1))
    //     .append_variable_outputs(3)
    //     .call()
    //     .await
    //     .unwrap()
    //     .value;
    // println!("✅ Orders has been matched");

    let deposit = methods
        .get_deposit(alice_address)
        .simulate()
        .await
        .unwrap()
        .value;

    if deposit < 1000 {
        methods
            .deposit()
            .tx_params(TxParameters::default().with_gas_price(1))
            .call_params(CallParameters::default().with_amount(1000))
            .unwrap()
            .call()
            .await
            .unwrap();
    }
    let order_id_0 = methods
        .create_order(asset1.bits256, amount1, 1000)
        .tx_params(TxParameters::default().with_gas_price(1))
        .call_params(
            CallParameters::default()
                .with_amount(amount0)
                .with_asset_id(asset0.asset_id),
        )
        .unwrap()
        .call()
        .await
        .unwrap()
        .value;
    println!("order_id_0 = {:?}", order_id_0);
    if deposit < 1000 {
        methods
            .deposit()
            .tx_params(TxParameters::default().with_gas_price(1))
            .call_params(CallParameters::default().with_amount(1000))
            .unwrap()
            .call()
            .await
            .unwrap();
    }
    let order_id_1 = methods
        .create_order(asset0.bits256, amount0, 1000)
        .tx_params(TxParameters::default().with_gas_price(1))
        .call_params(
            CallParameters::default()
                .with_amount(amount1)
                .with_asset_id(asset1.asset_id),
        )
        .unwrap()
        .call()
        .await
        .unwrap()
        .value;
    println!("order_id_1 = {:?}", order_id_1);
    methods
        .match_orders(order_id_0, order_id_1)
        .tx_params(TxParameters::default().with_gas_price(1))
        .append_variable_outputs(3)
        .call()
        .await
        .unwrap()
        .value;
    println!("✅ Orders has been matched");
}
