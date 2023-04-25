use crate::utils::number_utils::parse_units;
use fuels::prelude::{abigen, Contract, DeployConfiguration, WalletUnlocked};
use fuels::{
    tx::Address,
    types::{AssetId, ContractId, SizedAsciiString},
};

use rand::prelude::Rng;

pub struct DeployTokenConfig {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub mint_amount: u64,
}

pub struct Asset {
    pub config: DeployTokenConfig,
    pub contract_id: ContractId,
    pub asset_id: AssetId,
    pub instance: Option<TokenContract<WalletUnlocked>>,
    pub default_price: u64,
}

abigen!(Contract(
    name = "TokenContract",
    abi = "tests/artefacts/token/token_contract-abi.json"
));

pub mod token_abi_calls {

    use fuels::programs::call_response::FuelCallResponse;

    use super::*;

    pub async fn mint(c: &TokenContract<WalletUnlocked>) -> FuelCallResponse<()> {
        let res = c.methods().mint().append_variable_outputs(1).call().await;
        res.unwrap()
    }
    pub async fn mint_and_transfer(
        c: &TokenContract<WalletUnlocked>,
        amount: u64,
        recipient: Address,
    ) -> FuelCallResponse<()> {
        let res = c
            .methods()
            .mint_and_transfer(amount, recipient)
            .append_variable_outputs(1);

        res.call().await.unwrap()
    }
    pub async fn initialize(
        c: &TokenContract<WalletUnlocked>,
        config: TokenInitializeConfig,
        mint_amount: u64,
        address: Address,
    ) -> FuelCallResponse<()> {
        c.methods()
            .initialize(config, mint_amount, address)
            .call()
            .await
            .expect("❌ Cannot initialize token")
    }
}

pub async fn get_token_contract_instance(
    wallet: &WalletUnlocked,
    deploy_config: &DeployTokenConfig,
) -> TokenContract<WalletUnlocked> {
    let mut name = deploy_config.name.clone();
    let mut symbol = deploy_config.symbol.clone();
    let decimals = deploy_config.decimals;

    let mut rng = rand::thread_rng();
    let salt = rng.gen::<[u8; 32]>();

    let id = Contract::deploy(
        "./tests/artefacts/token/token_contract.bin",
        &wallet.clone(),
        DeployConfiguration::default().set_salt(salt),
    )
    .await
    .unwrap();

    let instance = TokenContract::new(id, wallet.clone());

    let mint_amount = parse_units(deploy_config.mint_amount, decimals);
    name.push_str(" ".repeat(32 - deploy_config.name.len()).as_str());
    symbol.push_str(" ".repeat(8 - deploy_config.symbol.len()).as_str());

    let config: TokenInitializeConfig = TokenInitializeConfig {
        name: SizedAsciiString::<32>::new(name).unwrap(),
        symbol: SizedAsciiString::<8>::new(symbol).unwrap(),
        decimals,
    };

    let address = Address::from(wallet.address());
    token_abi_calls::initialize(&instance, config, mint_amount, address).await;
    token_abi_calls::mint(&instance).await;

    instance
}
