use std::env;

use dotenv::dotenv;
use fuels::{
    accounts::{
        fuel_crypto::rand::{self, Rng},
        wallet::WalletUnlocked,
    },
    prelude::{abigen, Contract, LoadConfiguration, Provider, TxParameters},
};

use crate::utils::print_title;
abigen!(Contract(
    name = "DApp",
    abi = "out/debug/spot-market-abi.json"
));

const RPC: &str = "beta-4.fuel.network";

// start_block: 7709475
// 0x..   = 0x9cf9ccbf69b30530ccb62c927ed4bad12a22815a8f9e2c3a5b14f644a43889f6
// fuel.. = "fuel1nnuue0mfkvznpn9k9jf8a4966y4z9q26370zcwjmznmyffpc38mq38fus6"
#[tokio::test]
async fn deploy() {
    print_title("Deploy");
    dotenv().ok();

    let provider = Provider::connect(RPC).await.unwrap();

    let admin_pk = env::var("ADMIN").unwrap().parse().unwrap();
    let admin = WalletUnlocked::new_from_private_key(admin_pk, Some(provider.clone()));

    let mut rng = rand::thread_rng();
    let salt = rng.gen::<[u8; 32]>();
    let id = Contract::load_from("./out/debug/spot-market.bin", LoadConfiguration::default())
        .unwrap()
        .with_salt(salt)
        .deploy(&admin, TxParameters::default().with_gas_price(1))
        .await
        .unwrap();

    let block = provider.latest_block_height().await.unwrap();
    println!("✅ Contract deployed on beta-4");
    println!("start_block: {block}",);
    println!("0x..   = 0x{:?}", id.hash());
    println!("fuel.. = {:?}", id.to_string());
}
