use std::{env, str::FromStr};

use dotenv::dotenv;
use fuels::accounts::wallet::WalletUnlocked;
use fuels::prelude::{abigen, Bech32ContractId, Provider};
use fuels::types::ContractId;

use crate::utils::print_title;

abigen!(Contract(
    name = "DApp",
    abi = "out/debug/spot-market-abi.json"
));

const RPC: &str = "beta-4.fuel.network";
const CONTRACT_ADDRESS: &str = "0x9cf9ccbf69b30530ccb62c927ed4bad12a22815a8f9e2c3a5b14f644a43889f6";
const ORDER_ID: u64 = 3666;

#[tokio::test]
async fn print_order_test() {
    print_title("Print order");

    dotenv().ok();

    let provider = Provider::connect(RPC).await.unwrap();

    let alice_pk = env::var("ALICE").unwrap().parse().unwrap();
    let alice = WalletUnlocked::new_from_private_key(alice_pk, Some(provider.clone()));

    let contract_id: Bech32ContractId = ContractId::from_str(CONTRACT_ADDRESS).unwrap().into();
    let instance = DApp::new(contract_id, alice.clone());

    let order = instance
        .methods()
        .order_by_id(ORDER_ID)
        .simulate()
        .await
        .unwrap()
        .value;
    println!("{order:#?}");
}
