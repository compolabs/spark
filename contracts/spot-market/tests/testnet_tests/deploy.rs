use std::env;

use dotenv::dotenv;
use fuels::{
    accounts::{
        fuel_crypto::rand::{rngs::StdRng, Rng, SeedableRng},
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

// start_block: 5270152
// 0x..   = 0xebfc4ecfcb7f76b952ca76e1ee87633aef44f1cca43d1ee4ff6a296d78302748
// fuel.. = "fuel1a07yan7t0amtj5k2wms7apmr8th5fuwv5s73ae8ldg5k67psyayqmzuz30"

#[tokio::test]
async fn deploy() {
    print_title("Deploy");
    dotenv().ok();

    let provider = Provider::connect(RPC).await.unwrap();

    let admin_pk = env::var("ADMIN").unwrap().parse().unwrap();
    let admin = WalletUnlocked::new_from_private_key(admin_pk, Some(provider.clone()));

    let rng = &mut StdRng::seed_from_u64(tai64::Tai64::now().0);
    let salt: [u8; 32] = rng.gen();
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
