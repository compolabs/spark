// use fuels::prelude::*;
// use fuels::contract::contract::CallResponse;

// abigen!(TestToken, "out/debug/token_contract-abi.json");

// pub struct WaletsSetup {
//     pub wallet_owner: WalletUnlocked,
//     pub wallet1: WalletUnlocked,
//     pub wallet2: WalletUnlocked,
// }

// pub mod abi_calls {


//     use super::*;

//     pub async fn initialize(
//         config: testtoken_mod::Config,
//         contract: &TestToken,
//         mint_amount: u64,
//         address: Address,
//     ) -> Result<CallResponse<()>, Error> {
//         contract
//             .methods()
//             .initialize(config, mint_amount, address)
//             .call()
//             .await
//     }

//     pub async fn get_mint_amount(contract: &TestToken) -> Result<CallResponse<u64>, Error> {
//         contract.methods().get_mint_amount().call().await
//     }
//     pub async fn get_config(contract: &TestToken) -> Result<CallResponse<testtoken_mod::Config>, Error> {
//         contract.methods().config().call().await
//     }

//     pub async fn set_mint_amount(
//         contract: &TestToken,
//         mint_amount: u64,
//     ) -> Result<CallResponse<()>, Error> {
//         contract.methods().set_mint_amount(mint_amount).call().await
//     }

//     pub async fn mint_coins(
//         contract: &TestToken,
//         mint_amount: u64,
//     ) -> Result<CallResponse<()>, Error> {
//         contract.methods().mint_coins(mint_amount).call().await
//     }

//     pub async fn burn_coins(
//         contract: &TestToken,
//         burn_amount: u64,
//     ) -> Result<CallResponse<()>, Error> {
//         contract.methods().burn_coins(burn_amount).call().await
//     }

//     pub async fn get_balance(contract: &TestToken) -> Result<CallResponse<u64>, Error> {
//         contract.methods().get_balance().call().await
//     }

//     pub async fn transfer_token_to_output(
//         contract: &TestToken,
//         coins: u64,
//         asset_id: ContractId,
//         address: Address,
//     ) -> Result<CallResponse<()>, Error> {
//         contract
//             .methods()
//             .transfer_token_to_output(coins, asset_id, address)
//             .call()
//             .await
//     }

//     pub async fn transfer_coins(
//         contract: &TestToken,
//         coins: u64,
//         address: Address,
//     ) -> Result<CallResponse<()>, Error> {
//         contract
//             .methods()
//             .transfer_coins(coins, address)
//             .append_variable_outputs(1)
//             .call()
//             .await
//     }
//     pub async fn mint(contract: &TestToken) -> Result<CallResponse<()>, Error> {
//         contract
//             .methods()
//             .mint()
//             .append_variable_outputs(1)
//             .call()
//             .await
//     }
// }

// pub mod setup_utils {
//     use super::*;

//     pub async fn setup_wallets() -> WaletsSetup {
//         let initial_amount = 1000000000;
//         let num_wallets = 3;
//         let num_coins = 1;

//         let config = WalletsConfig::new(Some(num_wallets), Some(num_coins), Some(initial_amount));
//         let wallets = launch_custom_provider_and_get_wallets(config, None, None).await;
//         let wallet_owner = wallets.get(0).unwrap().clone();
//         let wallet1 = wallets.get(1).unwrap().clone();
//         let wallet2 = wallets.get(2).unwrap().clone();

//         return WaletsSetup {
//             wallet_owner,
//             wallet1,
//             wallet2,
//         };
//     }

//     pub async fn setup_token_contract(wallet_owner: &WalletUnlocked) -> TestToken {
//         let token_contract_id = Contract::deploy(
//             "out/debug/token_contract.bin",
//             wallet_owner,
//             TxParameters::default(),
//             StorageConfiguration::with_storage_path(Some(
//                 "./out/debug/token_contract-storage_slots.json".to_string(),
//             )),
//         )
//         .await
//         .unwrap();

//         return get_token_instance(&token_contract_id, wallet_owner);
//     }

//     pub async fn setup() -> (TestToken, WaletsSetup) {
//         let wallets = setup_wallets().await;
//         let token = setup_token_contract(&wallets.wallet_owner).await;
//         return (token, wallets);
//     }

//     pub fn get_token_instance(
//         token_contract_id: &Bech32ContractId,
//         wallet: &WalletUnlocked,
//     ) -> TestToken {
//         return TestToken::new(token_contract_id.clone(), wallet.clone());
//     }
// }


// pub fn parse_units(num: u64, decimals: u8) -> u64 {
//     num * 10u64.pow(decimals as u32)
// }

// pub fn format_units(num: u64, decimals: u8) -> u64 {
//     num / 10u64.pow(decimals as u32)
// }
