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
const CONTRACT_ADDRESS: &str = "0x06d8623a2093e9d307ac10b1539c66636507eeda7f3f1abd11d2d875b61be3e9";

const ASSET0: &str = "UNI";
const AMOUNT0: u64 = 300;

const ASSET1: &str = "USDC";
const AMOUNT1: u64 = 1000;

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

    let market_id = methods.calc_market_id(asset0.bits256, asset1.bits256).simulate().await.unwrap().value;
    if methods.get_market(market_id).simulate().await.is_err(){
        methods
            .create_market(asset0.bits256, asset1.bits256)
            .tx_params(TxParameters::default().with_gas_price(1))
            .call()
            .await
            .unwrap();
        println!("✅ Market has been created");
    }

    let order_id_0 = methods
        .create_order(market_id, amount1, 1000)
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
    let order = methods
        .order_by_id(order_id_0)
        .simulate()
        .await
        .unwrap()
        .value;
    println!("✅ Order {order_id_0} created = {:#?}", order);

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
        .create_order(market_id, amount0, 1000)
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

    let order = methods
        .order_by_id(order_id_1)
        .simulate()
        .await
        .unwrap()
        .value;
    println!("✅ Order {order_id_1} created = {:#?}", order);

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
