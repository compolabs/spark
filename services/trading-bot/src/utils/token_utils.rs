use fuels::prelude::{abigen,  WalletUnlocked};
use fuels::{
    tx::Address,
    types::{AssetId, ContractId},
};

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
    abi = "src/artefacts/token/token_contract-abi.json"
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
}
