use dotenv::dotenv;
use fuels::prelude::*;
use std::str::FromStr;

abigen!(UsdtContract, "out/debug/token_contract-abi.json");

const RPC: &str = "beta-3.fuel.network";
const USDT_ADDRESS: &str = "0x2cffcbc96717e5a102db1d5da45c189248d00a070cd65a822096b9733d3b071e";

pub async fn setup() -> (WalletUnlocked, UsdtContract, Provider) {
    let provider = match Provider::connect(RPC).await {
        Ok(p) => p,
        Err(error) => panic!("❌ Problem creating provider: {:#?}", error),
    };

    dotenv().ok();
    let secret = match std::env::var("SECRET") {
        Ok(s) => s,
        Err(error) => panic!("❌ Cannot find .env file: {:#?}", error),
    };

    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    let usdt_dapp_id = Bech32ContractId::from(ContractId::from_str(USDT_ADDRESS).unwrap());
    let usdt_dapp_instance = UsdtContract::new(usdt_dapp_id, wallet.clone());

    println!("👛 Account address     @ {}", wallet.clone().address());
    println!(
        "🗞  USDT dapp address   @ {}",
        usdt_dapp_instance.get_contract_id()
    );
    return (wallet, usdt_dapp_instance, provider);
}