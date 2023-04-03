use dotenv::dotenv;
use fuels::{prelude::*, types::SizedAsciiString};

use crate::actions::initialize::abigen_bindings::token_contract_mod;

const RPC: &str = "beta-3.fuel.network";

const CONTRACT_ID: &str = "fuel1ds98z5m4k5gwrm6k9w6m8fa0ktymffecqfg78u54uv39gy9evjyqz5sv0l";

pub struct DeployConfig {
    name: String,
    symbol: String,
    decimals: u8,
    mint_amount: f64,
}

abigen!(Contract(
    name = "TokenContract",
    abi = "out/debug/token_contract-abi.json"
));

#[tokio::test]
async fn initialize() {
    let mut deploy_config: DeployConfig = DeployConfig {
        name: String::from("Compound"),
        symbol: String::from("COMP"),
        decimals: 9,
        mint_amount: 5.0,
    };

    let provider = match Provider::connect(RPC).await {
        Ok(p) => p,
        Err(error) => panic!("❌ Problem creating provider: {:#?}", error),
    };
    dotenv().ok();
    let secret = match std::env::var("SECRET") {
        Ok(s) => s,
        Err(error) => panic!("❌ Cannot find .env file: {:#?}", error),
    };

    let wallet = WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider));

    let contract_id:Bech32ContractId = CONTRACT_ID.parse().unwrap();

    let instance = TokenContract::new(contract_id, wallet.clone());
    let methods = instance.methods();

    deploy_config
        .name
        .push_str(" ".repeat(32 - deploy_config.name.len()).as_str());
    deploy_config
        .symbol
        .push_str(" ".repeat(8 - deploy_config.symbol.len()).as_str());

    let mint_amount =
        (deploy_config.mint_amount * 10f64.powf(deploy_config.decimals as f64)) as u64;
    let config: token_contract_mod::TokenInitializeConfig =
        token_contract_mod::TokenInitializeConfig {
            name: SizedAsciiString::<32>::new(deploy_config.name).unwrap(),
            symbol: SizedAsciiString::<8>::new(deploy_config.symbol).unwrap(),
            decimals: deploy_config.decimals,
        };
    let _res = methods
        .initialize(config, mint_amount, Address::from(wallet.address()))
        .tx_params(TxParameters::default().set_gas_price(1))
        .call()
        .await;
    println!("{} Initialize\n", if _res.is_ok() { "✅" } else { "❌" });
    if _res.is_err() {
        println!("Error = {:?}", _res.err().unwrap());
    }
}
