use dotenv::dotenv;
use fuels::prelude::{
    abigen, Address, Bech32ContractId, ContractId, Provider, SettableContract, WalletUnlocked,
};
use serenity::model::prelude::ChannelId;
use serenity::prelude::*;
use std::{env, fmt::format, str::FromStr, thread::sleep, time::Duration};

mod utils;
use utils::{market_abi_calls::market_abi_calls, print_swaygang_sign::print_swaygang_sign};

abigen!(
    Contract(
        name = "LimitOrders",
        abi = "src/artefacts/limit_orders-abi.json"
    )
);

const RPC: &str = "node-beta-2.fuel.network";
const LIMIT_ORDERS_ADDRESS: &str = "";

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
    let instance = LimitOrders::new(bech32_id.clone(), wallet.clone());

    // let mut users = Users::new(MarketContract::new(bech32_id, wallet.clone()));
    // users.fetch().await;

    //discord
    let token = env::var("DISCORD_TOKEN").expect("❌ Expected a token in the environment");
    let client = Client::builder(&token, GatewayIntents::default())
        .await
        .expect("Err creating client");
    let channel_id = env::var("CHANNEL_ID").expect("❌ Expected a channel id in the environment");

    let channel = ChannelId(channel_id.parse::<u64>().unwrap());

    print_swaygang_sign("✅ Matcher is alive");
    loop {
        users.fetch().await;
        let list = users.list.clone();
        // println!("Total users {}", list.len());
        let mut index = 0;
        while index < list.len() {
            let user = list[index];
            let res = market_abi_calls::is_liquidatable(&market, &contracts, user).await;
            if res.is_err() {
                println!("error = {:?}", res.err());
                continue;
            }
            let is_liquidatable = res.unwrap().value;
            if is_liquidatable {
                let _res = market_abi_calls::absorb(&market, &contracts, vec![user])
                    .await
                    .unwrap();
                
                // let tx_link =
                    // format!("https://fuellabs.github.io/block-explorer-v2/transaction/{}");
                channel
                    .say(
                        client.cache_and_http.http.clone(),
                        format!("🔥 0x{user} has been liquidated."),
                    )
                    .await
                    .unwrap();
            }
            index += 1;
        }
        sleep(Duration::from_secs(10));
    }
}

struct Users {
    pub list: Vec<Address>,
    market: MarketContract,
    last_check_borrowers_amount: u64,
}

impl Users {
    fn new(market: MarketContract) -> Users {
        Users {
            list: vec![],
            market,
            last_check_borrowers_amount: 0,
        }
    }
    async fn fetch(&mut self) {
        let methods = self.market.methods();
        let amount = methods
            .get_borrowers_amount()
            .simulate()
            .await
            .unwrap()
            .value;
        let mut index = self.last_check_borrowers_amount;
        while index < amount {
            let borrower = methods.get_borrower(index).simulate().await.unwrap().value;
            self.list.push(borrower);
            index += 1;
        }
        self.last_check_borrowers_amount = amount;
    }
}
