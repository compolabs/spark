use crate::utils::print_swaygang_sign::print_swaygang_sign;
use dotenv::dotenv;
use fuels::{
    client::schema::AssetId,
    prelude::{Bech32ContractId, Provider, WalletUnlocked},
    types::{Address, ContractId},
};
// use serenity::{model::prelude::ChannelId, prelude::GatewayIntents, Client};
use std::{collections::HashMap, env, fs, str::FromStr, thread::sleep, time::Duration};
use utils::limit_orders_utils::{
    limit_orders_abi_calls::{create_order, CreatreOrderArguments},
    LimitOrdersContract, Status,
};
mod utils;
use serde::{Deserialize, Serialize};

// const RPC: &str = "beta-3.fuel.network";
const RPC: &str = "127.0.0.1:4000";
const LIMIT_ORDERS_ADDRESS: &str =
    "0x7662a02959e3e2d681589261e95a7a4bc8ac66c6d66999a0fe01bb6c36ada7c6";
const backend_url: &str = "http://localhost:5000/api/v1";

#[derive(Deserialize)]
pub struct Order {
    asset0: ContractId,
    amount0: u64,
    asset1: ContractId,
    amount1: u64,
    status: String,
    fulfilled0: u64,
    fulfilled1: u64,
    owner: Address,
    id: u64,
    timestamp: u64,
    matcher_fee: u64,
    matcher_fee_used: u64,
}

#[derive(Deserialize)]
pub struct Token {
    symbol: String,
    decimals: u8,
    asset_id: String,
    default_price: u64,
}

#[tokio::main]
async fn main() {
    // contract
    let provider = match Provider::connect(RPC).await {
        Ok(p) => p,
        Err(error) => panic!("❌ Problem creating provider: {:#?}", error),
    };
    dotenv().ok();
    let secret = env::var("SECRET").expect("❌ Expected a account secret in the environment");
    let wallet = WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider));

    let bech32_id = Bech32ContractId::from(ContractId::from_str(LIMIT_ORDERS_ADDRESS).unwrap());
    let instance = LimitOrdersContract::new(bech32_id.clone(), wallet.clone());

    let tokens_json_str = fs::read_to_string("src/tokens.json").expect("No tokens.json");
    let tokens: Vec<Token> = serde_json::from_str(tokens_json_str.as_str()).unwrap();

    let client = reqwest::Client::new();
    // let url = format!("{backend_url}/allSymbols");
    // let symbols = client.get(url).send().await.unwrap().text().await.unwrap();
    // let symbols: Vec<String> = serde_json::from_str(&symbols).unwrap();
    let symbols = vec!["BTC/USDC"];
    print_swaygang_sign("✅ Trading bot is alive");
    loop {
        for symbol in symbols.iter() {
            let split: Vec<&str> = symbol.split("/").collect();
            let asset0 = (&tokens).into_iter().find(|t| t.symbol == split[0]);
            let asset0 = asset0.unwrap();
            let asset1 = (&tokens).into_iter().find(|t| t.symbol == split[1]);
            let asset1 = asset1.unwrap();

            let price_decimal: u32 = 9;
            //TODO get price from oracle----------------------------------------------
            let price0 = asset0.default_price;
            let price1 = asset1.default_price;
            let price: f64 = price0 as f64 / price1 as f64 * 10u64.pow(price_decimal) as f64;
            //------------------------------------------------------------------------

            let amount0 = 1000 / price0; //todo * decimal0 / 1e9
                                         //TODO mint amount0
            let args = CreatreOrderArguments {
                asset0: AssetId::from_str(&asset0.asset_id).unwrap().into(),
                amount0,
                asset1: ContractId::from_str(&asset1.asset_id).unwrap().into(),
                amount1: 0, //TODO calc amount 1
                matcher_fee: 1000,
            };
            create_order(&instance, &args).await.unwrap();

            sleep(Duration::from_secs(10));

            let search = format!(
                "maxPrice={price}&priceDecimal={price_decimal}&status=active&symbol={symbol}"
            );
            let url = format!("{backend_url}/orders?{search}");
            let orders = client.get(url).send().await.unwrap().text().await.unwrap();
            let orders: Vec<Order> = serde_json::from_str(&orders).unwrap();

            let mut amount1 = 0;
            for order in orders.iter() {
                amount1 += order.amount1
            }
        }
        //TODO add price filter
        //     let mut orders = client
        //         .get("http://localhost:5000/api/v1/allSymbols")
        //         .send()
        //         .await
        //         .unwrap()
        //         .json()
        //         .await
        //         .unwrap();
        //     let mut i = 0;
        //     'a_order_cycle: while i < orders.len() {
        //         let order_a = &orders[i].clone();
        //         let mut j = 0;

        //         while j < orders.len() {
        //             let order_b = orders[j].clone();
        //             let price_a = order_a.amount_1 as f64 / order_a.amount_0 as f64;
        //             let price_b = order_b.amount_0 as f64 / order_b.amount_1 as f64;
        //             if order_a.asset_0 == order_b.asset_1
        //                 && order_a.asset_1 == order_b.asset_0
        //                 && price_a <= price_b
        //                 && order_a.status == Status::Active
        //                 && order_b.status == Status::Active
        //             {
        //                 let res = match_orders(&instance, order_a.id, order_b.id).await;
        //                 if res.is_ok() {
        //                     orders[i].status = Status::Completed;
        //                     orders[j].status = Status::Completed;

        //                     let asset0 = tokens.into_iter().find(|t| {
        //                         t["asset_id"].as_str().unwrap()
        //                             == format!("0x{}", order_a.asset_0.to_string())
        //                     });
        //                     let asset1 = tokens.into_iter().find(|t| {
        //                         t["asset_id"].as_str().unwrap()
        //                             == format!("0x{}", order_a.asset_1.to_string())
        //                     });
        //                     if asset0.is_none() || asset1.is_none() {
        //                         println!("asset0/asset1 is not found");
        //                         continue;
        //                     }
        //                     let a_symbol = asset0.unwrap()["symbol"].as_str().unwrap();
        //                     let a_decimals = asset0.unwrap()["decimals"].as_f64().unwrap();
        //                     let b_symbol = asset1.unwrap()["symbol"].as_str().unwrap();
        //                     let b_decimals = asset1.unwrap()["decimals"].as_f64().unwrap();

        //                     let msg = format!(
        //                         "Match 👩‍❤️‍👨!\n Order {}: {} {a_symbol} ➡️ {} {b_symbol}\n Order {}: {} {b_symbol} ➡️ {} {a_symbol}\n\n",
        //                         order_a.id,
        //                         order_a.amount_0 as f64 / 10f64.powf(a_decimals),
        //                         order_a.amount_1 as f64 / 10f64.powf(b_decimals),
        //                         order_b.id,
        //                         order_b.amount_0 as f64 / 10f64.powf(b_decimals),
        //                         order_b.amount_1 as f64 / 10f64.powf(a_decimals),
        //                     );
        //                     // channel
        //                     //     .say(client.cache_and_http.http.clone(), msg)
        //                     //     .await
        //                     //     .unwrap();
        //                     let (trade0, trade1) = res.unwrap().value;

        //                     let mut vec = vec![HashMap::new(), HashMap::new()];
        //                     vec[0].insert("asset0", format!("0x{}", trade0.asset_0));
        //                     vec[0].insert("amount0", trade0.amount_0.to_string());
        //                     vec[0].insert("asset1", format!("0x{}", trade0.asset_1));
        //                     vec[0].insert("amount1", trade0.amount_1.to_string());
        //                     vec[0].insert("timestamp", Tai64(trade0.timestamp).to_unix().to_string());

        //                     vec[1].insert("asset0", format!("0x{}", trade1.asset_0));
        //                     vec[1].insert("amount0", trade1.amount_0.to_string());
        //                     vec[1].insert("asset1", format!("0x{}", trade1.asset_1));
        //                     vec[1].insert("amount1", trade1.amount_1.to_string());
        //                     vec[1].insert("timestamp", Tai64(trade1.timestamp).to_unix().to_string());

        //                     let _res = client.post(url).json(&vec).send().await.unwrap();

        //                     println!("{msg}");

        //                     continue 'a_order_cycle;
        //                 } else {
        //                     println!(
        //                         "Error: \n0 {:?}1 {:?}\n❌ {:?}\n\n",
        //                         order_a,
        //                         order_b,
        //                         res.err().unwrap()
        //                     );
        //                 }
        //             }
        //             j += 1;
        //         }
        //         i += 1;
        //     }
        break;
        // sleep(Duration::from_secs(10));
    }
}
