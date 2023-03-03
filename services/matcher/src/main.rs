use crate::utils::print_swaygang_sign::print_swaygang_sign;
use dotenv::dotenv;
use fuels::prelude::{
    abigen, Address, Bech32ContractId, ContractId, Provider, SettableContract, WalletUnlocked,
};
use serenity::model::prelude::ChannelId;
use serenity::prelude::*;
use std::{env, fmt::format, str::FromStr, thread::sleep, time::Duration};
use tuple_conv::RepeatedTuple;
use utils::limit_orders_utils::{limit_orders_abi_calls::get_orders, LimitOrdersContract, Order};
mod utils;

const RPC: &str = "node-beta-2.fuel.network";
const LIMIT_ORDERS_ADDRESS: &str =
    "0x386ef6d3568e912b19045e446a307bd7b8f7ec0e1cc8f5b123b2d1aa2b241a44";

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

    let mut ordersFetcher =
        OpenOrdersFetcher::new(LimitOrdersContract::new(bech32_id, wallet.clone()));
    ordersFetcher.fetch().await;

    //discord
    let token = env::var("DISCORD_TOKEN").expect("❌ Expected a token in the environment");
    let client = Client::builder(&token, GatewayIntents::default())
        .await
        .expect("Err creating client");
    let channel_id = env::var("CHANNEL_ID").expect("❌ Expected a channel id in the environment");

    let channel = ChannelId(channel_id.parse::<u64>().unwrap());

    print_swaygang_sign("✅ Matcher is alive");
    loop {
        ordersFetcher.fetch().await;
        let orders = ordersFetcher.orders.clone();
        // println!("Total users {}", list.len());
        // let mut index = 0;
        // while index < list.len() {
        //     let user = list[index];
        //     let res = market_abi_calls::is_liquidatable(&market, &contracts, user).await;
        //     if res.is_err() {
        //         println!("error = {:?}", res.err());
        //         continue;
        //     }
        //     let is_liquidatable = res.unwrap().value;
        //     if is_liquidatable {
        //         let _res = market_abi_calls::absorb(&market, &contracts, vec![user])
        //             .await
        //             .unwrap();

        //         // let tx_link =
        //             // format!("https://fuellabs.github.io/block-explorer-v2/transaction/{}");
        //         channel
        //             .say(
        //                 client.cache_and_http.http.clone(),
        //                 format!("🔥 0x{user} has been liquidated."),
        //             )
        //             .await
        //             .unwrap();
        //     }
        //     index += 1;
        // }
        println!("Ok ✅",);
        sleep(Duration::from_secs(10));
    }
}

struct OpenOrdersFetcher {
    pub orders: Vec<Order>,
    instance: LimitOrdersContract,
}

impl OpenOrdersFetcher {
    fn new(instance: LimitOrdersContract) -> OpenOrdersFetcher {
        OpenOrdersFetcher {
            orders: vec![],
            instance,
        }
    }
    async fn fetch(&mut self) {
        let mut offset = 0;
        let mut orders: Vec<Order> = vec![];
        while offset == 0 || orders.last().unwrap().id > 1 {
            let mut batch: Vec<Order> = get_orders(&self.instance, offset)
                .await
                .to_vec()
                .into_iter()
                .filter(|o| o.is_some())
                .map(|o| o.unwrap())
                .collect();
            orders.append(&mut batch);
            offset += 10;
        }
        self.orders = orders;
    }
}
