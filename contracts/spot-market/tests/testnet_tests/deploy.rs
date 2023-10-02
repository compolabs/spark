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

/*
✅ Contract deployed on beta-4
0x..   = 0x22a43f9ef75c6e041bd2bbc1606f9eb54dc3d2b85ef9047fe90402c9f7bf881a
fuel.. = "fuel1y2jrl8hht3hqgx7jh0qkqmu7k4xu854ctmusgllfqspvnaal3qdq06q67u"
*/

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

    println!("✅ Contract deployed on beta-4");
    println!("0x..   = 0x{:?}", id.hash());
    println!("fuel.. = {:?}", id.to_string());
}
