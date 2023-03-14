use fuels::{
    prelude::{Bech32Address, Provider},
    types::AssetId,
};

pub mod cotracts_utils;
pub mod local_tests_utils;
pub mod number_utils;
// pub mod orders_fetcher;
//-------------

// Get the balance of a given token of an address
pub async fn get_balance(provider: &Provider, address: &Bech32Address, asset: AssetId) -> u64 {
    provider.get_asset_balance(address, asset).await.unwrap()
}
// use fuels::{
//     core::abi_encoder::UnresolvedBytes,
//     prelude::{
//         abigen, launch_custom_provider_and_get_wallets, Address, AssetConfig, Bech32Address,
//         Config, Provider, TxParameters,
//     },
//     programs::script_calls::ScriptCallHandler,
//     test_helpers::WalletsConfig,
//     tx::{AssetId, Input, Output, TxPointer},
//     types::resource::Resource,
// };

// // The fee-paying base asset
// const BASE_ASSET: AssetId = AssetId::new([0u8; 32]);
// // Offered asset is the asset that will be locked behind the predicate
// const OFFERED_ASSET: AssetId = AssetId::new([2u8; 32]);

// // Create wallet config for two wallets with base, offered, and ask assets
// fn configure_wallets(asked_asset: AssetId) -> WalletsConfig {
//     let assets = [BASE_ASSET, OFFERED_ASSET, asked_asset];

//     WalletsConfig::new_multiple_assets(
//         2,
//         assets
//             .map(|asset| AssetConfig {
//                 id: asset,
//                 num_coins: 1,
//                 coin_amount: 1_000_000_000,
//             })
//             .to_vec(),
//     )
// }

// /// Tests that the predicate can be spent. Parameterized by test cases
// /// ALICE: offered -> asked
// /// BOB:   asked -> offered
// pub async fn test_predicate_spend_with_parameters(
//     ask_amount: u64,
//     asked_asset: AssetId,
//     receiver: &str,
// ) {
//     println!(
//         "(ask_amount, asked_asset) = {:?}",
//         (ask_amount, asked_asset)
//     );
//     println!(
//         "(offer_amount, OFFERED_ASSET) = {:?}",
//         (1000, OFFERED_ASSET)
//     );
//     let alice_address: Bech32Address = receiver.parse().unwrap();

//     // ==================== WALLETS ====================
//     let provider_config = Config {
//         utxo_validation: true,
//         ..Config::local_node()
//     };

//     let wallets = &launch_custom_provider_and_get_wallets(
//         configure_wallets(asked_asset),
//         Some(provider_config),
//         None,
//     )
//     .await;

//     let alice = &wallets[0];
//     let bob = &wallets[1];
//     assert_eq!(alice_address, alice.address().clone());

//     // ==================== PREDICATE ====================
//     let provider = alice.get_provider().unwrap();

//     let predicate =
//         LimitOrder::load_from("../swap-predicate/out/debug/swap-predicate.bin").unwrap();

//     // ==================== ALICE CREATES THE ORDER (TRANSFER) ====================
//     // Alice transfer offered_amount of OFFERED_ASSET to the predicate root
//     let offered_amount = 1000;
//     predicate
//         .receive(alice, offered_amount, OFFERED_ASSET, None)
//         .await
//         .unwrap();

//     let initial_taker_offered_token_balance =
//         get_balance(provider, bob.address(), OFFERED_ASSET).await;
//     let initial_taker_asked_token_balance = get_balance(provider, bob.address(), asked_asset).await;
//     let initial_receiver_balance = get_balance(provider, &alice_address, asked_asset).await;

//     // The predicate root has received the coin
//     assert_eq!(
//         get_balance(provider, predicate.address(), OFFERED_ASSET).await,
//         offered_amount
//     );

//     // ==================== BOB SIDE CALL ====================
//     // Get predicate coin to unlock
//     let predicate_coin = &provider
//         .get_spendable_resources(predicate.address(), OFFERED_ASSET, 1)
//         .await
//         .unwrap()[0];
//     let predicate_coin_utxo_id = match predicate_coin {
//         Resource::Coin(coin) => coin.utxo_id,
//         _ => panic!(),
//     };
//     // Get other coin to spend
//     let swap_coin = &provider
//         .get_spendable_resources(bob.address(), asked_asset, 1)
//         .await
//         .unwrap()[0];
//     let (swap_coin_utxo_id, swap_coin_amount) = match swap_coin {
//         Resource::Coin(coin) => (coin.utxo_id, coin.amount),
//         _ => panic!(),
//     };

//     // Configure inputs and outputs to send coins from the predicate root to another address
//     // The predicate allows to spend its tokens if `ask_amount` is sent to the receiver.

//     // Offered asset coin belonging to the predicate root
//     // CoinPredicate
//     let input_predicate = Input::CoinPredicate {
//         utxo_id: predicate_coin_utxo_id,
//         tx_pointer: TxPointer::default(),
//         owner: predicate.address().into(),
//         amount: offered_amount,
//         asset_id: OFFERED_ASSET,
//         maturity: 0,
//         predicate: predicate.code(),
//         predicate_data: vec![],
//     };

//     // Asked asset coin belonging to the wallet taking the order
//     // CoinSigned
//     let input_from_taker = Input::CoinSigned {
//         utxo_id: swap_coin_utxo_id,
//         tx_pointer: TxPointer::default(),
//         owner: Address::from(bob.address()),
//         amount: swap_coin_amount,
//         asset_id: asked_asset,
//         witness_index: 0,
//         maturity: 0,
//     };

//     // Output for the asked coin transferred from the taker to the receiver
//     // Output
//     let output_to_receiver = Output::Coin {
//         to: Address::from(alice_address.clone()),
//         amount: ask_amount,
//         asset_id: asked_asset,
//     };

//     // Output for the offered coin transferred from the predicate to the order taker
//     // Output
//     let output_to_taker = Output::Coin {
//         to: Address::from(bob.address()),
//         amount: offered_amount,
//         asset_id: OFFERED_ASSET,
//     };

//     // Change output for unspent asked asset
//     // Output
//     let output_asked_change = Output::Change {
//         to: Address::from(bob.address()),
//         amount: 0,
//         asset_id: asked_asset,
//     };

//     let script_call = ScriptCallHandler::<()>::new(
//         vec![],
//         UnresolvedBytes::default(),
//         bob.clone(),
//         provider.clone(),
//         Default::default(),
//     )
//     .with_inputs(vec![input_predicate, input_from_taker])
//     .with_outputs(vec![
//         output_to_receiver,
//         output_to_taker,
//         output_asked_change,
//     ])
//     .tx_params(TxParameters::new(None, Some(10_000_000), None));

//     let _response = script_call.call().await.unwrap();

//     let predicate_balance = get_balance(provider, predicate.address(), OFFERED_ASSET).await;
//     let taker_asked_token_balance = get_balance(provider, bob.address(), asked_asset).await;
//     let taker_offered_token_balance = get_balance(provider, bob.address(), OFFERED_ASSET).await;
//     let receiver_balance = get_balance(provider, &alice_address, asked_asset).await;

//     // The predicate root's coin has been spent
//     assert_eq!(predicate_balance, 0);

//     // Receiver has been paid `ask_amount`
//     assert_eq!(receiver_balance, initial_receiver_balance + ask_amount);

//     // Taker has sent `ask_amount` of the asked token and received `offered_amount` of the offered token in return
//     assert_eq!(
//         taker_asked_token_balance,
//         initial_taker_asked_token_balance - ask_amount
//     );
//     assert_eq!(
//         taker_offered_token_balance,
//         initial_taker_offered_token_balance + offered_amount
//     );
// }
