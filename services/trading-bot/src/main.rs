use crate::print_swaygang_sign::print_swaygang_sign;
use dotenv::dotenv;
use fuels::{
    prelude::{abigen, CallParameters, Provider, TxParameters, ViewOnlyAccount, WalletUnlocked},
    types::{Address, AssetId, ContractId},
};
use src20_sdk::{token_factory_abi_calls, TokenFactoryContract};
use std::{env, str::FromStr};
use utils::{print_swaygang_sign, token_utils::load_tokens};

abigen!(
    Contract(
        name = "OracleContract",
        abi = "src/artefacts/oracle/oracle-abi.json"
    ),
    Contract(
        name = "SpotMarketContract",
        abi = "src/artefacts/spot_market/spot-market-abi.json"
    )
);

mod utils;

const RPC: &str = "beta-4.fuel.network";
const SPOT_MARKET_ADDRESS: &str =
    "0xebfc4ecfcb7f76b952ca76e1ee87633aef44f1cca43d1ee4ff6a296d78302748";
const ORACLE_ADDRESS: &str = "0x8f7a76602f1fce4e4f20135a0ab4d22b3d9a230215ccee16c0980cf286aaa93c";
const FACTORY_ADDRESS: &str = "0xd8c627b9cd9ee42e2c2bd9793b13bc9f8e9aad32e25a99ea574f23c1dd17685a";

#[tokio::main]
async fn main() {
    dotenv().ok();
    let provider = Provider::connect(RPC).await.unwrap();
    let secret = env::var("SECRET").unwrap();
    let wallet = WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider));
    let address = wallet.address().into();

    // Spark Spot Market Contract
    let id = ContractId::from_str(SPOT_MARKET_ADDRESS).unwrap();
    let spot_market = SpotMarketContract::new(id.clone(), wallet.clone());

    // Oracle Contract
    let id = ContractId::from_str(ORACLE_ADDRESS).unwrap();
    let oracle = OracleContract::new(id, wallet.clone());

    // Token Factory Contract
    let id = ContractId::from_str(FACTORY_ADDRESS).unwrap();
    let factory = TokenFactoryContract::new(id, wallet.clone());
    let assets = load_tokens("src/artefacts/tokens.json").await;

    // let bech32_id = Bech32ContractId::from(ContractId::from_str(CONTRACT_ADDRESS).unwrap());
    // let spark_instance = LimitOrdersContract::new(bech32_id, wallet.clone());

    // let bech32_id = Bech32ContractId::from(ContractId::from_str(ORACLE_ADDRESS).unwrap());
    // let oracle_instance = OracleContract::new(bech32_id, wallet.clone());

    // let token_configs: Vec<TokenConfig> =
    //     from_str(&read_to_string("src/tokens.json").unwrap()).unwrap();
    // let mut tokens: HashMap<String, Token> = HashMap::new();
    // for config in token_configs {
    //     let contract_id: Bech32ContractId = ContractId::from_str(&config.asset_id).unwrap().into();
    //     let instance = TokenContract::new(contract_id, wallet.clone());
    //     tokens.insert(
    //         config.symbol.clone(),
    //         Token {
    //             symbol: config.symbol,
    //             decimals: config.decimals,
    //             asset_id: AssetId::from_str(&config.asset_id).unwrap(),
    //             contract_id: ContractId::from_str(&config.asset_id).unwrap(),
    //             instance,
    //         },
    //     );
    // }

    // let client = reqwest::Client::new();
    // // let url = format!("{backend_url}/allSymbols");
    // // let symbols = client.get(url).send().await.unwrap().text().await.unwrap();
    // // let symbols: Vec<String> = serde_json::from_str(&symbols).unwrap();
    // // let symbols = vec!["USDC/BTC", "BTC/USDC"];
    let symbols = vec!["USDC/UNI", "UNI/USDC"];
    print_swaygang_sign("✅ Trading bot is alive");

    loop {
        for symbol in symbols.iter() {
            let split: Vec<&str> = symbol.split("/").collect();
            let asset0 = &assets[split[0]];
            let asset1 = &assets[split[1]];

            let price_decimal: u32 = 9;
            let methods = oracle.methods();

            let price0 = methods.get_price(asset0.asset_id.into()).simulate().await;
            let price0 = price0.unwrap().value.price as u128;

            let price1 = methods.get_price(asset1.asset_id.into()).simulate().await;
            let price1 = price1.unwrap().value.price as u128;

            let price = price0 * 10u128.pow(price_decimal) / price1;
            println!("🪬 Oracle price = {:?}\n", price);
            let price_buy: u128 = price;
            let price_sell: u128 = price;
            let amount0 = 10u128.pow(9 + 3 + asset0.decimals as u32) / price0;
            let amount1 = price_sell * amount0
                / 10u128.pow(price_decimal + (asset0.decimals - asset1.decimals) as u32);
            println!(
                "🔴 {symbol} Sell order: {} {} -> {} {} | price = {}",
                amount0 as f64 / 10f64.powf(asset0.decimals as f64),
                asset0.symbol,
                amount1 as f64 / 10f64.powf(asset1.decimals as f64),
                asset1.symbol,
                price_sell as f64 / 10f64.powf(9.0)
            );
            if wallet.get_asset_balance(&asset0.asset_id).await.unwrap() < amount0 as u64 {
                token_factory_abi_calls::mint(&factory, address, &asset0.symbol, amount0 as u64)
                    .await
                    .unwrap();
            }

           //получаем заказы на покупку и считаем сумму выше чем цена из оракула

            spot_market
                .methods()
                .deposit()
                .tx_params(TxParameters::default().with_gas_price(1))
                .call_params(CallParameters::default().with_amount(1000))
                .unwrap()
                .call()
                .await
                .unwrap();

            let res = spot_market
                .methods()
                .create_order(asset1.asset_id.into(), amount1 as u64, 1000)
                .tx_params(TxParameters::default().with_gas_price(1))
                .call_params(
                    CallParameters::default()
                        .with_amount(amount0 as u64)
                        .with_asset_id(asset0.asset_id.into()),
                )
                .unwrap()
                .call()
                .await;
            //         let res = create_order(&spark_instance, &args).await;
            println!("Sell order created; OK={}\n", res.is_ok());

            //         // let url = format!("{BACKEND_URL}/orderbook?symbol={symbol}");
            //         let url = format!("{BACKEND_URL}/orderbook?symbol=BTC/USDC"); //FIXME
            //         let res = client.get(url).send().await.unwrap().text().await.unwrap();
            //         let res: OrderResponse = serde_json::from_str(&res).unwrap();
            //         let mut orderbook = res.orderbook;
            //         //FIXME
            //         if symbol.eq(&String::from("USDC/BTC")) {
            //             orderbook = Orderbook {
            //                 buy: orderbook.sell,
            //                 sell: orderbook.buy,
            //             };
            //         }

            //         let limit = 10u128.pow(9 + 7 + asset1.decimals) / price1;

            //         let mut amount1: u128 = 0;
            //         if orderbook.sell.len() > 0 && orderbook.sell[0].asset1 == asset1.contract_id {
            //             for order in orderbook.sell.iter() {
            //                 let order_price = order.amount1.parse::<u128>().unwrap()
            //                     * 10u128.pow(price_decimal + asset0.decimals - asset1.decimals)
            //                     / order.amount0.parse::<u128>().unwrap();
            //                 if order_price < price_buy && amount1 <= limit {
            //                     amount1 += order.amount1.parse::<u128>().unwrap()
            //                         - order.fulfilled1.parse::<u128>().unwrap()
            //                 }
            //             }
            //         }
            //         if amount1 == 0 {
            //             continue;
            //         }
            //         let amount0 = amount1 * 10u128.pow(9 + asset0.decimals - asset1.decimals) / price_buy;

            //         println!(
            //             "🟢 {symbol}  Buy order: {} {} -> {} {} | price = {} | limit = {:?} {}",
            //             amount1 as f64 / 10f64.powf(asset1.decimals.into()),
            //             asset1.symbol,
            //             amount0 as f64 / 10f64.powf(asset0.decimals.into()),
            //             asset0.symbol,
            //             price_buy as f64 / 10f64.powf(9.0),
            //             limit as f64 / 10f64.powf(asset1.decimals as f64),
            //             asset1.symbol
            //         );
            //         if wallet.get_asset_balance(&asset1.asset_id).await.unwrap() < amount1 as u64 {
            //             let res = mint_and_transfer(&asset1.instance, amount1 as u64, address).await;
            //             if res.is_err() {
            //                 continue;
            //             }
            //         }
            //         sleep(Duration::from_secs(1));
            //         let args = CreatreOrderArguments {
            //             asset0: asset1.asset_id.clone(),
            //             amount0: amount1 as u64,
            //             asset1: asset0.contract_id.clone(),
            //             amount1: amount0 as u64,
            //             matcher_fee: 1000,
            //         };

            //         let _res = deposit(&spark_instance, 1000).await;
            //         let res = create_order(&spark_instance, &args).await;
            //         println!("Buy order created; OK={}\n", res.is_ok());
            //         // if res.is_err() {
            //         //     dbg!(res.err());
            //         // }
            //         sleep(Duration::from_secs(300));
        }
    }
}
