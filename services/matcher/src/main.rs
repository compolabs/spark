use crate::utils::{
    limit_orders_utils::limit_orders_abi_calls::match_orders,
    print_swaygang_sign::print_swaygang_sign,
};
use dotenv::dotenv;
use fuels::{
    prelude::{Bech32ContractId, Provider, WalletUnlocked},
    types::ContractId,
};
// use serenity::{model::prelude::ChannelId, prelude::GatewayIntents, Client};
use std::{collections::HashMap, env, fs, str::FromStr, thread::sleep, time::Duration};
use utils::{
    limit_orders_utils::{LimitOrdersContract, Order, Status},
    orders_fetcher::OrdersFetcher,
};
mod utils;

// const RPC: &str = "beta-3.fuel.network";
const RPC: &str = "127.0.0.1:4000";
const LIMIT_ORDERS_ADDRESS: &str =
    "0x7662a02959e3e2d681589261e95a7a4bc8ac66c6d66999a0fe01bb6c36ada7c6";

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

    let mut orders_fetcher =
        OrdersFetcher::new(LimitOrdersContract::new(bech32_id, wallet.clone()));
    orders_fetcher.fetch_all_orders().await;

    let tokens_json_str =
        fs::read_to_string("src/tokens.json").expect("Should have been able to read the file");
    let tokens: serde_json::Value = serde_json::from_str(tokens_json_str.as_str()).unwrap();
    let tokens = tokens.as_array().unwrap();

    //discord
    // let token = env::var("DISCORD_TOKEN").expect("❌ Expected a token in the environment");
    // let client = Client::builder(&token, GatewayIntents::default())
    //     .await
    //     .expect("Err creating client");
    // let channel_id = env::var("CHANNEL_ID").expect("❌ Expected a channel id in the environment");

    // let channel = ChannelId(channel_id.parse::<u64>().unwrap());

    let client = reqwest::Client::new();
    let url = "http://localhost:5000/api/v1/trade";

    print_swaygang_sign("✅ Matcher is alive");
    loop {
        orders_fetcher.update_active_orders().await;
        orders_fetcher.fetch_new_orders().await;
        let mut orders: Vec<Order> = orders_fetcher
            .orders
            .clone()
            .into_iter()
            .filter(|o| o.status == Status::Active)
            .collect();
        let mut i = 0;
        'a_order_cycle: while i < orders.len() {
            let order_a = &orders[i].clone();
            let mut j = 0;

            while j < orders.len() {
                let order_b = orders[j].clone();
                let price_a = order_a.amount_1 as f64 / order_a.amount_0 as f64;
                let price_b = order_b.amount_0 as f64 / order_b.amount_1 as f64;
                if order_a.asset_0 == order_b.asset_1
                    && order_a.asset_1 == order_b.asset_0
                    && price_a <= price_b
                    && order_a.status == Status::Active
                    && order_b.status == Status::Active
                {
                    let res = match_orders(&instance, order_a.id, order_b.id).await;
                    if res.is_ok() {
                        orders[i].status = Status::Completed;
                        orders[j].status = Status::Completed;

                        let asset0 = tokens.into_iter().find(|t| {
                            t["asset_id"].as_str().unwrap()
                                == format!("0x{}", order_a.asset_0.to_string())
                        });
                        let asset1 = tokens.into_iter().find(|t| {
                            t["asset_id"].as_str().unwrap()
                                == format!("0x{}", order_a.asset_1.to_string())
                        });
                        if asset0.is_none() || asset1.is_none() {
                            println!("asset0/asset1 is not found");
                            continue;
                        }
                        let a_symbol = asset0.unwrap()["symbol"].as_str().unwrap();
                        let a_decimals = asset0.unwrap()["decimals"].as_f64().unwrap();
                        let b_symbol = asset1.unwrap()["symbol"].as_str().unwrap();
                        let b_decimals = asset1.unwrap()["decimals"].as_f64().unwrap();

                        let msg = format!(
                            "Match 👩‍❤️‍👨!\n Order {}: {} {a_symbol} ➡️ {} {b_symbol}\n Order {}: {} {b_symbol} ➡️ {} {a_symbol}\n\n",
                            order_a.id,
                            order_a.amount_0 as f64 / 10f64.powf(a_decimals),
                            order_a.amount_1 as f64 / 10f64.powf(b_decimals),
                            order_b.id,
                            order_b.amount_0 as f64 / 10f64.powf(b_decimals),
                            order_b.amount_1 as f64 / 10f64.powf(a_decimals),
                        );
                        // channel
                        //     .say(client.cache_and_http.http.clone(), msg)
                        //     .await
                        //     .unwrap();
                        let (trade0, trade1) = res.unwrap().value;

                        let mut vec = vec![HashMap::new(), HashMap::new()];
                        vec[0].insert("asset0", format!("0x{}", trade0.asset_0));
                        vec[0].insert("amount0", trade0.amount_0.to_string());
                        vec[0].insert("asset1", format!("0x{}", trade0.asset_1));
                        vec[0].insert("amount1", trade0.amount_1.to_string());
                        vec[0].insert("timestamp", trade0.timestamp.to_string());

                        vec[1].insert("asset0", format!("0x{}", trade1.asset_0));
                        vec[1].insert("amount0", trade1.amount_0.to_string());
                        vec[1].insert("asset1", format!("0x{}", trade1.asset_1));
                        vec[1].insert("amount1", trade1.amount_1.to_string());
                        vec[1].insert("timestamp", trade1.timestamp.to_string());

                        let _res = client.post(url).json(&vec).send().await.unwrap();

                        println!("{msg}");

                        continue 'a_order_cycle;
                    } else {
                        println!(
                            "Error: \n0 {:?}1 {:?}\n❌ {:?}\n\n",
                            order_a,
                            order_b,
                            res.err().unwrap()
                        );
                    }
                }
                j += 1;
            }
            i += 1;
        }
        sleep(Duration::from_secs(10));
    }
}
