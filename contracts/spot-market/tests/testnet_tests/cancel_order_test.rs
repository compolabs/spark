use std::{env, str::FromStr};

use dotenv::dotenv;
use fuels::accounts::wallet::WalletUnlocked;
use fuels::prelude::{
    abigen, Bech32ContractId, CallParameters, Provider, TxParameters, ViewOnlyAccount,
};
use fuels::programs::call_utils::TxDependencyExtension;
use fuels::types::{Address, ContractId};

use crate::utils::contracts_utils::token_utils::load_tokens;
use crate::utils::print_title;

abigen!(Contract(
    name = "DApp",
    abi = "out/debug/spot-market-abi.json"
));

const RPC: &str = "beta-4.fuel.network";
const CONTRACT_ADDRESS: &str = "0xa06a249aec454510179bf9b3d688d8983339ae56620e300fd1bcff34b1eb32ba";

#[tokio::test]
async fn cancel_order_test() {
    print_title("Cancel order");

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
    let usdc = tokens.get("USDC").unwrap();
    let uni = tokens.get("UNI").unwrap();

    let amount0 = 1000_000_000_u64; //1000 USDC
    let amount1 = 300_000_000_000_u64; //200 UNI
    println!("USDC AssetId (asset0) = 0x{:?}", usdc.asset_id);
    println!("UNI AssetId (asset1) = 0x{:?}", uni.asset_id);
    println!("amount0 = {:?} USDC", amount0 / 1000_000);
    println!("amount1 = {:?} UNI", amount1 / 1000_000_000);

    // let initial_alice_usdc_balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();
    // if initial_alice_usdc_balance < amount0 {
    //     token_abi_calls::mint(&usdc.instance, amount0, alice_address)
    //         .await
    //         .unwrap();
    //     println!("Alice minting {:?} USDC\n", amount0 / 1000_000);
    // }
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
            .tx_params(TxParameters::default().with_gas_price(1))
            .call_params(CallParameters::default().with_amount(1000))
            .unwrap()
            .call()
            .await
            .unwrap();
    }
    let order_id = instance
        .methods()
        .create_order(uni.bits256, amount1, 1000)
        .tx_params(TxParameters::default().with_gas_price(1))
        .call_params(
            CallParameters::default()
                .with_amount(amount0)
                .with_asset_id(usdc.asset_id),
        )
        .unwrap()
        .call()
        .await
        .unwrap()
        .value;

    instance
        .methods()
        .cancel_order(order_id)
        .tx_params(TxParameters::default().with_gas_price(1))
        .append_variable_outputs(1)
        .call()
        .await
        .unwrap();
}
