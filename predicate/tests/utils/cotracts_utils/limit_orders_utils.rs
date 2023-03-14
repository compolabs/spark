use fuels::prelude::abigen;

abigen!(Predicate(
    name = "LimitOrdersPredicate",
    abi = "out/debug/limit_orders-abi.json"
));

// pub async fn deploy_limit_orders_contract(admin: &WalletUnlocked) -> LimitOrdersContract {
//     let id = Contract::deploy(
//         "./out/debug/limit_orders.bin",
//         &admin,
//         TxParameters::default(),
//         StorageConfiguration::with_storage_path(Some(
//             "./out/debug/limit_orders-storage_slots.json".to_string(),
//         )),
//     )
//     .await
//     .unwrap();

//     LimitOrdersContract::new(id, admin.clone())
// }

pub mod limit_orders_interactions {

    use super::*;
    use fuels::core::abi_encoder::UnresolvedBytes;
    use fuels::programs::call_response::FuelCallResponse;
    use fuels::programs::script_calls::ScriptCallHandler;
    use fuels::tx::{AssetId, Input, Output, TxPointer};
    use fuels::types::resource::Resource;
    use fuels::types::Address;
    use fuels::{prelude::TxParameters, signers::WalletUnlocked};

    pub async fn cancel_order(
        predicate: &LimitOrdersPredicate,
        wallet: &WalletUnlocked,
        asset0: AssetId,
        amount0: u64,
    ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
        let provider = wallet.get_provider().unwrap();
        // Get predicate coin to unlock
        let predicate_coin = &provider
            .get_spendable_resources(predicate.address(), asset0, 1)
            .await
            .unwrap()[0];
        let predicate_coin_utxo_id = match predicate_coin {
            Resource::Coin(coin) => coin.utxo_id,
            _ => panic!(),
        };

        // Offered asset coin belonging to the predicate root
        let input_predicate = Input::CoinPredicate {
            utxo_id: predicate_coin_utxo_id,
            tx_pointer: TxPointer::default(),
            owner: predicate.address().into(),
            amount: amount0,
            asset_id: asset0,
            maturity: 0,
            predicate: predicate.code(),
            predicate_data: vec![],
        };

        // Use a change output to send the unlocked coins back to the wallet
        let output_offered_change = Output::Change {
            to: Address::from(wallet.address()),
            amount: 0,
            asset_id: asset0,
        };

        let script_call = ScriptCallHandler::<()>::new(
            vec![],
            UnresolvedBytes::default(),
            wallet.clone(),
            provider.clone(),
            Default::default(),
        )
        .with_inputs(vec![input_predicate])
        .with_outputs(vec![output_offered_change])
        .tx_params(TxParameters::new(Some(1), Some(10_000_000), None));

        script_call.call().await
    }

    pub async fn fulfill_order(
        predicate: &LimitOrdersPredicate,
        wallet: &WalletUnlocked,
        order_owner_address: &Address,
        asset0: AssetId,
        amount0: u64,
        asset1: AssetId,
        amount1: u64,
    ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
        let provider = wallet.get_provider().unwrap();

        // ==================== BOB SIDE CALL ====================
        // Get predicate coin to unlock
        let predicate_coin = &provider
            .get_spendable_resources(predicate.address(), asset0, 1)
            .await
            .unwrap()[0];
        let predicate_coin_utxo_id = match predicate_coin {
            Resource::Coin(coin) => coin.utxo_id,
            _ => panic!(),
        };
        // Get other coin to spend
        let swap_coin = &provider
            .get_spendable_resources(wallet.address(), asset1, 1)
            .await
            .unwrap()[0];
        let (swap_coin_utxo_id, swap_coin_amount) = match swap_coin {
            Resource::Coin(coin) => (coin.utxo_id, coin.amount),
            _ => panic!(),
        };

        // Configure inputs and outputs to send coins from the predicate root to another address
        // The predicate allows to spend its tokens if `ask_amount` is sent to the receiver.

        // Offered asset coin belonging to the predicate root
        // CoinPredicate
        let input_predicate = Input::CoinPredicate {
            utxo_id: predicate_coin_utxo_id,
            tx_pointer: TxPointer::default(),
            owner: predicate.address().into(),
            amount: amount0,
            asset_id: asset0,
            maturity: 0,
            predicate: predicate.code(),
            predicate_data: vec![],
        };

        // Asked asset coin belonging to the wallet taking the order
        // CoinSigned
        let input_from_taker = Input::CoinSigned {
            utxo_id: swap_coin_utxo_id,
            tx_pointer: TxPointer::default(),
            owner: Address::from(wallet.address()),
            amount: swap_coin_amount,
            asset_id: asset1,
            witness_index: 0,
            maturity: 0,
        };

        // Output for the asked coin transferred from the taker to the receiver
        // Output
        let output_to_receiver = Output::Coin {
            to: order_owner_address.clone(),
            amount: amount1,
            asset_id: asset1,
        };

        // Output for the offered coin transferred from the predicate to the order taker
        // Output
        let output_to_taker = Output::Coin {
            to: Address::from(wallet.address()),
            amount: amount0,
            asset_id: asset0,
        };

        // Change output for unspent asked asset
        // Output
        let output_asked_change = Output::Change {
            to: Address::from(wallet.address()),
            amount: 0,
            asset_id: asset1,
        };

        let script_call = ScriptCallHandler::<()>::new(
            vec![],
            UnresolvedBytes::default(),
            wallet.clone(),
            provider.clone(),
            Default::default(),
        )
        .with_inputs(vec![input_predicate, input_from_taker])
        .with_outputs(vec![
            output_to_receiver,
            output_to_taker,
            output_asked_change,
        ])
        .tx_params(TxParameters::new(None, Some(10_000_000), None));

        script_call.call().await
    }

    //     // pub async fn get_deposit_by_address(contract: &LimitOrdersContract, address: Address) -> u64 {
    //     //     contract
    //     //         .methods()
    //     //         .get_deposit_by_address(address)
    //     //         .simulate()
    //     //         .await
    //     //         .unwrap()
    //     //         .value
    //     // }

    //     // pub async fn orders_amount(contract: &LimitOrdersContract) -> u64 {
    //     //     contract
    //     //         .methods()
    //     //         .orders_amount()
    //     //         .simulate()
    //     //         .await
    //     //         .unwrap()
    //     //         .value
    //     // }
    //     pub async fn get_trades(
    //         contract: &LimitOrdersContract,
    //         offset: u64,
    //     ) -> (
    //         Option<Trade>,
    //         Option<Trade>,
    //         Option<Trade>,
    //         Option<Trade>,
    //         Option<Trade>,
    //         Option<Trade>,
    //         Option<Trade>,
    //         Option<Trade>,
    //         Option<Trade>,
    //         Option<Trade>,
    //     ) {
    //         contract
    //             .methods()
    //             .trades(offset)
    //             .simulate()
    //             .await
    //             .unwrap()
    //             .value
    //     }
    //     pub async fn get_orders(
    //         contract: &LimitOrdersContract,
    //         offset: u64,
    //     ) -> (
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //     ) {
    //         contract
    //             .methods()
    //             .orders(offset)
    //             .simulate()
    //             .await
    //             .unwrap()
    //             .value
    //     }

    //     pub async fn order_by_id(
    //         contract: &LimitOrdersContract,
    //         id: u64,
    //     ) -> Result<FuelCallResponse<Order>, fuels::prelude::Error> {
    //         contract.methods().order_by_id(id).simulate().await
    //     }

    //     pub async fn orders_by_id(
    //         contract: &LimitOrdersContract,
    //         ids: [u64; 10],
    //     ) -> (
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //         Option<Order>,
    //     ) {
    //         contract
    //             .methods()
    //             .orders_by_id(ids)
    //             .simulate()
    //             .await
    //             .unwrap()
    //             .value
    //     }

    //     pub async fn deposit(
    //         contract: &LimitOrdersContract,
    //         amount: u64,
    //     ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
    //         let call_params = CallParameters::new(Some(amount), Some(BASE_ASSET_ID), None);
    //         let tx_params = TxParameters::new(Some(100), Some(100_000_000), Some(0));
    //         contract
    //             .methods()
    //             .deposit()
    //             .call_params(call_params)
    //             // .unwrap()
    //             .tx_params(tx_params)
    //             // .append_variable_outputs(1)
    //             .call()
    //             .await
    //     }
    //     // pub async fn withdraw(
    //     //     contract: &LimitOrdersContract,
    //     //     amount: u64,
    //     // ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
    //     //     let tx_params = TxParameters::new(Some(100), Some(100_000_000), Some(0));
    //     //     contract
    //     //         .methods()
    //     //         .withdraw(amount)
    //     //         .tx_params(tx_params)
    //     //         // .append_variable_outputs(1)
    //     //         .call()
    //     //         .await
    //     // }

    //     pub struct CreatreOrderArguments {
    //         pub asset0: fuels::tx::AssetId,
    //         pub amount0: u64,
    //         pub asset1: ContractId,
    //         pub amount1: u64,
    //         pub matcher_fee: u64,
    //     }

    //     pub async fn create_order(
    //         contract: &LimitOrdersContract,
    //         args: &CreatreOrderArguments,
    //     ) -> Result<FuelCallResponse<u64>, fuels::prelude::Error> {
    //         let call_params = CallParameters::new(Some(args.amount0), Some(args.asset0), None);
    //         let tx_params = TxParameters::new(Some(100), Some(100_000_000), Some(0));
    //         contract
    //             .methods()
    //             .create_order(args.asset1, args.amount1, args.matcher_fee)
    //             .tx_params(tx_params)
    //             .call_params(call_params)
    //             // .unwrap()
    //             .append_variable_outputs(1)
    //             .call()
    //             .await
    //     }

    //     pub struct FulfillOrderArguments {
    //         pub id: u64,
    //         pub amount1: u64,
    //         pub asset1: fuels::tx::AssetId,
    //     }

    //     pub async fn match_orders(
    //         contract: &LimitOrdersContract,
    //         order_id_a: u64,
    //         order_id_b: u64,
    //     ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
    //         let tx_params = TxParameters::new(Some(100), Some(100_000_000), Some(0));
    //         contract
    //             .methods()
    //             .match_orders(order_id_a, order_id_b)
    //             .tx_params(tx_params)
    //             .append_variable_outputs(4)
    //             .append_message_outputs(4)
    //             .call()
    //             .await
    //     }
}
