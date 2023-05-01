use crate::utils::{
    limit_orders_utils::limit_orders_abi_calls::deposit, print_swaygang_sign::print_swaygang_sign,
};
use dotenv::dotenv;
use fuels::{
    prelude::{abigen, Bech32ContractId, Provider, ViewOnlyAccount, WalletUnlocked},
    types::{Address, AssetId, ContractId},
};
use serde_json::from_str;
use std::{
    collections::HashMap, env, fs::read_to_string, str::FromStr, thread::sleep, time::Duration,
};

abigen!(Contract(
    name = "OracleContract",
    abi = "src/artefacts/oracle-abi.json"
));
use utils::{
    limit_orders_utils::{
        limit_orders_abi_calls::{create_order, CreatreOrderArguments},
        LimitOrdersContract,
    },
    token_utils::{token_abi_calls::mint_and_transfer, TokenContract},
};
mod utils;
use serde::Deserialize;

const RPC: &str = "beta-3.fuel.network";
const CONTRACT_ADDRESS: &str = "0x7662a02959e3e2d681589261e95a7a4bc8ac66c6d66999a0fe01bb6c36ada7c6";
const ORACLE_ADDRESS: &str = "0xcff9283e360854a2f4523c6e5a569a9032a222b8ea6d91cdd1506f0375e5afb5";
const BACKEND_URL: &str = "https://allspark-backend.herokuapp.com/api/v1";

#[derive(Deserialize)]
pub struct Order {
    // asset0: ContractId,
    amount0: String,
    asset1: ContractId,
    amount1: String,
    // status: String,
    // fulfilled0: String,
    fulfilled1: String,
    // owner: Address,
    // id: u64,
    // timestamp: u64,
    // matcher_fee: String,
    // matcher_fee_used: String,
}
#[derive(Deserialize)]
pub struct Orderbook {
    sell: Vec<Order>,
    buy: Vec<Order>,
}

#[derive(Deserialize)]
pub struct OrderResponse {
    orderbook: Orderbook,
}

#[derive(Deserialize)]
pub struct TokenConfig {
    symbol: String,
    decimals: u32,
    asset_id: String,
}
pub struct Token {
    symbol: String,
    decimals: u32,
    asset_id: AssetId,
    contract_id: ContractId,
    instance: TokenContract<WalletUnlocked>,
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let provider = Provider::connect(RPC).await.unwrap();
    let secret = env::var("SECRET").expect("❌ Expected a account secret in the environment");
    let wallet = WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider));
    let address = Address::from(wallet.address());

    let bech32_id = Bech32ContractId::from(ContractId::from_str(CONTRACT_ADDRESS).unwrap());
    let spark_instance = LimitOrdersContract::new(bech32_id, wallet.clone());

    let bech32_id = Bech32ContractId::from(ContractId::from_str(ORACLE_ADDRESS).unwrap());
    let oracle_instance = OracleContract::new(bech32_id, wallet.clone());

    let token_configs: Vec<TokenConfig> =
        from_str(&read_to_string("src/tokens.json").unwrap()).unwrap();
    let mut tokens: HashMap<String, Token> = HashMap::new();
    for config in token_configs {
        let contract_id: Bech32ContractId = ContractId::from_str(&config.asset_id).unwrap().into();
        let instance = TokenContract::new(contract_id, wallet.clone());
        tokens.insert(
            config.symbol.clone(),
            Token {
                symbol: config.symbol,
                decimals: config.decimals,
                asset_id: AssetId::from_str(&config.asset_id).unwrap(),
                contract_id: ContractId::from_str(&config.asset_id).unwrap(),
                instance,
            },
        );
    }

    let client = reqwest::Client::new();
    // let url = format!("{backend_url}/allSymbols");
    // let symbols = client.get(url).send().await.unwrap().text().await.unwrap();
    // let symbols: Vec<String> = serde_json::from_str(&symbols).unwrap();
    // let symbols = vec!["USDC/BTC", "BTC/USDC"];
    let symbols = vec!["USDC/BTC", "BTC/USDC"];
    print_swaygang_sign("✅ Trading bot is alive");

    loop {
        for symbol in symbols.iter() {
            let split: Vec<&str> = symbol.split("/").collect();
            let asset0 = &tokens[split[0]];
            let asset1 = &tokens[split[1]];

            let price_decimal: u32 = 9;
            let methods = oracle_instance.methods();
            let price0 = methods
                .get_price(asset0.contract_id.clone())
                .simulate()
                .await
                .unwrap()
                .value
                .price as u128;
            let price1 = methods
                .get_price(asset1.contract_id.clone())
                .simulate()
                .await
                .unwrap()
                .value
                .price as u128;

            let price = price0 * 10u128.pow(price_decimal) / price1;
            println!("🪬 Oracle price = {:?}\n", price);
            let price_buy: u128 = price * 11 / 10;
            let price_sell: u128 = price * 9 / 10;
            let amount0 = 10u128.pow(9 + 3 + asset0.decimals) / price0;
            let amount1 = price_sell * amount0
                / 10u128.pow(price_decimal + asset0.decimals - asset1.decimals);
            println!(
                "🔴 {symbol} Sell order: {} {} -> {} {} | price = {}",
                amount0 as f64 / 10f64.powf(asset0.decimals.into()),
                asset0.symbol,
                amount1 as f64 / 10f64.powf(asset1.decimals.into()),
                asset1.symbol,
                price_sell as f64 / 10f64.powf(9.0)
            );
            if wallet.get_asset_balance(&asset0.asset_id).await.unwrap() < amount0 as u64 {
                let res = mint_and_transfer(&asset0.instance, amount0 as u64, address).await;
                if res.is_err() {
                    continue;
                }
            }
            sleep(Duration::from_secs(1));

            let args = CreatreOrderArguments {
                asset0: asset0.asset_id.clone(),
                amount0: amount0 as u64,
                asset1: asset1.contract_id.clone(),
                amount1: amount1 as u64,
                matcher_fee: 1000,
            };
            let _res = deposit(&spark_instance, 1000).await;
            let res = create_order(&spark_instance, &args).await;
            println!("Sell order created; OK={}\n", res.is_ok());
            // if res.is_err() {
            // dbg!(res.err());
            // }
            sleep(Duration::from_secs(15));

            // let url = format!("{BACKEND_URL}/orderbook?symbol={symbol}");
            let url = format!("{BACKEND_URL}/orderbook?symbol=BTC/USDC"); //FIXME
            let res = client.get(url).send().await.unwrap().text().await.unwrap();
            let res: OrderResponse = serde_json::from_str(&res).unwrap();
            let mut orderbook = res.orderbook;
            //FIXME
            if symbol.eq(&String::from("USDC/BTC")) {
                orderbook = Orderbook {
                    buy: orderbook.sell,
                    sell: orderbook.buy,
                };
            }

            let limit = 10u128.pow(9 + 7 + asset1.decimals) / price1;

            let mut amount1: u128 = 0;
            if orderbook.sell.len() > 0 && orderbook.sell[0].asset1 == asset1.contract_id {
                for order in orderbook.sell.iter() {
                    let order_price = order.amount1.parse::<u128>().unwrap()
                        * 10u128.pow(price_decimal + asset0.decimals - asset1.decimals)
                        / order.amount0.parse::<u128>().unwrap();
                    if order_price < price_buy && amount1 <= limit {
                        amount1 += order.amount1.parse::<u128>().unwrap()
                            - order.fulfilled1.parse::<u128>().unwrap()
                    }
                }
            }
            if amount1 == 0 {
                continue;
            }
            let amount0 = amount1 * 10u128.pow(9 + asset0.decimals - asset1.decimals) / price_buy;

            println!(
                "🟢 {symbol}  Buy order: {} {} -> {} {} | price = {} | limit = {:?} {}",
                amount1 as f64 / 10f64.powf(asset1.decimals.into()),
                asset1.symbol,
                amount0 as f64 / 10f64.powf(asset0.decimals.into()),
                asset0.symbol,
                price_buy as f64 / 10f64.powf(9.0),
                limit as f64 / 10f64.powf(asset1.decimals as f64),
                asset1.symbol
            );
            if wallet.get_asset_balance(&asset1.asset_id).await.unwrap() < amount1 as u64 {
                let res = mint_and_transfer(&asset1.instance, amount1 as u64, address).await;
                if res.is_err() {
                    continue;
                }
            }
            sleep(Duration::from_secs(1));
            let args = CreatreOrderArguments {
                asset0: asset1.asset_id.clone(),
                amount0: amount1 as u64,
                asset1: asset0.contract_id.clone(),
                amount1: amount0 as u64,
                matcher_fee: 1000,
            };

            let _res = deposit(&spark_instance, 1000).await;
            let res = create_order(&spark_instance, &args).await;
            println!("Buy order created; OK={}\n", res.is_ok());
            // if res.is_err() {
            //     dbg!(res.err());
            // }
            sleep(Duration::from_secs(15));
        }
    }
}
