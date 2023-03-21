use std::{collections::HashMap, fs, str::FromStr};

use fuels::prelude::*;

use crate::utils::number_utils::parse_units;

use super::cotracts_utils::token_utils::{self, Asset, DeployTokenConfig};

pub async fn init_wallets() -> Vec<WalletUnlocked> {
    launch_custom_provider_and_get_wallets(
        WalletsConfig::new(
            Some(5),             /* Single wallet */
            Some(1),             /* Single coin (UTXO) */
            Some(1_000_000_000), /* Amount per coin */
        ),
        None,
        None,
    )
    .await
}

pub async fn init_tokens(admin: &WalletUnlocked) -> HashMap<String, Asset> {
    let deploy_config_json_str =
        fs::read_to_string("tests/tokens.json").expect("Should have been able to read the file");
    let deploy_configs: serde_json::Value =
        serde_json::from_str(deploy_config_json_str.as_str()).unwrap();
    let deploy_configs = deploy_configs.as_array().unwrap();
    let mut assets: HashMap<String, Asset> = HashMap::new();
    for config_value in deploy_configs {
        let config = DeployTokenConfig {
            name: String::from(config_value["name"].as_str().unwrap()),
            symbol: String::from(config_value["symbol"].as_str().unwrap()),
            decimals: config_value["decimals"].as_u64().unwrap() as u8,
            mint_amount: config_value["mint_amount"].as_u64().unwrap(),
        };

        let instance = if config.symbol != "ETH" {
            Some(token_utils::get_token_contract_instance(&admin, &config).await)
        } else {
            None
        };
        let contract_id = match instance {
            Option::Some(instance) => ContractId::from(instance.contract_id()),
            Option::None => ContractId::from_str(BASE_ASSET_ID.to_string().as_str())
                .expect("Cannot parse BASE_ASSET_ID to contract id"),
        };

        assets.insert(
            String::from(config_value["symbol"].as_str().unwrap()),
            Asset {
                config,
                contract_id,
                asset_id: AssetId::from(*contract_id),
                default_price: parse_units(config_value["default_price"].as_u64().unwrap(), 9),
                instance: Option::None,
            },
        );
    }
    assets
}
