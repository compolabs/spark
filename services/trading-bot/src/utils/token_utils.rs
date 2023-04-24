use fuels::prelude::{abigen, WalletUnlocked};
use fuels::tx::Address;

abigen!(Contract(
    name = "TokenContract",
    abi = "src/artefacts/token/token_contract-abi.json"
));

pub mod token_abi_calls {

    use fuels::{prelude::TxParameters, programs::call_response::FuelCallResponse};

    use super::*;

    pub async fn mint_and_transfer(
        c: &TokenContract<WalletUnlocked>,
        amount: u64,
        recipient: Address,
    ) -> Result<FuelCallResponse<()>, fuels::types::errors::Error> {
        c.methods()
            .mint_and_transfer(amount, recipient)
            .append_variable_outputs(1)
            .tx_params(TxParameters::default().set_gas_price(1))
            .call()
            .await
    }
}
