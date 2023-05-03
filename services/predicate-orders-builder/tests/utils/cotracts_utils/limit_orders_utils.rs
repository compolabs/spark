use fuels::prelude::abigen;

abigen!(
    Predicate(
        name = "LimitOrdersPredicate",
        abi = "tests/artefacts/predicate-abi.json"
    ),
    Script(
        name = "CreateOrderScript",
        abi = "create_order_script/out/debug/create_order_script-abi.json"
    )
);

pub mod limit_orders_interactions {

    use std::collections::HashMap;

    use crate::utils::cotracts_utils::token_utils::TokenContract;

    use fuels::accounts::predicate::Predicate;
    use fuels::prelude::Account;
    use fuels::prelude::ResourceFilter;
    use fuels::prelude::TxParameters;
    use fuels::prelude::WalletUnlocked;
    use fuels::programs::call_response::FuelCallResponse;
    use fuels::programs::script_calls::ScriptCallHandler;
    use fuels::tx::AssetId;
    use fuels::tx::Output;
    use fuels::tx::Receipt;
    use fuels::types::coin::Coin;
    use fuels::types::input::Input;
    use fuels::types::resource::Resource;
    use fuels::types::unresolved_bytes::UnresolvedBytes;
    use fuels::types::Address;

    // FIXME
    // pub async fn create_order(
    //     wallet: &WalletUnlocked,
    //     id: String,
    //     predicate: &Predicate,
    //     asset0: &TokenContract<WalletUnlocked>,
    //     amount0: u64,
    //     asset1: &TokenContract<WalletUnlocked>,
    //     amount1: u64,
    // ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
    //     let bin_path = "create_order_script/out/debug/create_order_script.bin";
    //     let instance = CreateOrderScript::new(wallet.clone(), bin_path);
    //     let provider = wallet.provider().unwrap();
    //     let assets: Vec<AssetId> = vec![AssetId::from(*ContractId::from(asset0.contract_id()))];
    //     let transaction_parameters =
    //         transaction_inputs_outputs(&wallet, &provider, &assets, Some(&vec![amount0])).await;

    //     let params = CreateOrderParams {
    //         id: SizedAsciiString::<30>::new(id).unwrap(),
    //         predicate_address: predicate.address().into(),
    //         asset_0: asset0.contract_id().into(),
    //         amount_0: amount0,
    //         asset_1: asset1.contract_id().into(),
    //         amount_1: amount1,
    //         owner: Address::from(wallet.address()),
    //     };

    //     instance
    //         .main(params)
    //         .tx_params(TxParameters::default().set_gas_price(1))
    //         .with_inputs(transaction_parameters.inputs)
    //         .with_outputs(transaction_parameters.outputs)
    //         .call()
    //         .await
    // }

    pub async fn cancel_order(
        predicate: &Predicate,
        predicate_code: Vec<u8>,
        wallet: &WalletUnlocked,
        asset0: AssetId,
        amount0: u64,
    ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
        let provider = wallet.provider().unwrap();
        // Get predicate coin to unlock
        let filter = ResourceFilter {
            from: predicate.address().clone(),
            asset_id: asset0,
            amount: 1,
            ..Default::default()
        };
        let predicate_coin = &provider
            // .get_spendable_resources(predicate.address(), asset0, 1)
            .get_spendable_resources(filter)
            .await
            .unwrap()[0];
        let predicate_coin_utxo_id = match predicate_coin {
            Resource::Coin(coin) => coin.utxo_id,
            _ => panic!(),
        };

        // Offered asset coin belonging to the predicate root
        // let input_predicate = Input::CoinPredicate {
        //     utxo_id: predicate_coin_utxo_id,
        //     tx_pointer: TxPointer::default(),
        //     owner: predicate.address().into(),
        //     amount: amount0,
        //     asset_id: asset0,
        //     maturity: 0,
        //     predicate: predicate.code(),
        //     predicate_data: vec![],
        // };

        let coin = Coin {
            amount: amount0,
            block_created: 0,
            asset_id: asset0,
            utxo_id: predicate_coin_utxo_id,
            maturity: 0,
            owner: predicate.address().clone(),
            status: fuels::types::coin::CoinStatus::default(),
        };
        let input_predicate = Input::ResourcePredicate {
            resource: Resource::Coin(coin),
            code: predicate_code.clone().into(),
            data: predicate.data().clone(),
        };

        // Use a change output to send the unlocked coins back to the wallet
        let output_offered_change = Output::Change {
            to: Address::from(wallet.address()),
            amount: 0,
            asset_id: asset0,
        };

        let script_call = ScriptCallHandler::new(
            vec![],
            UnresolvedBytes::default(),
            wallet.clone(),
            provider.clone(),
            Default::default(),
        )
        .with_inputs(vec![input_predicate])
        .with_outputs(vec![output_offered_change])
        .tx_params(TxParameters::default().set_gas_price(1));

        script_call.call().await
    }

    pub async fn fulfill_order(
        base_predicate: (&Predicate, Vec<u8>),
        partial_fullfill_params: Option<(&Predicate, Vec<u8>, u64)>,
        wallet: &WalletUnlocked,
        order_owner_address: &Address,
        asset0: AssetId,
        amount0: u64,
        asset1: AssetId,
        amount1: u64,
    ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
        let (predicate, predicate_code) = base_predicate;
        let provider = wallet.provider().unwrap();

        // ==================== BOB SIDE CALL ====================
        // Get predicate coin to unlock
        let filter = ResourceFilter {
            from: predicate.address().clone(),
            asset_id: asset0,
            amount: 1,
            ..Default::default()
        };
        let predicate_coin = &provider.get_spendable_resources(filter).await.unwrap()[0];
        let predicate_coin_utxo_id = match predicate_coin {
            Resource::Coin(coin) => coin.utxo_id,
            _ => panic!(),
        };
        // Get other coin to spend
        let filter = ResourceFilter {
            from: wallet.address().clone(),
            asset_id: asset1,
            amount: 1,
            ..Default::default()
        };
        let swap_coin = &provider.get_spendable_resources(filter).await.unwrap()[0];
        let (swap_coin_utxo_id, swap_coin_amount) = match swap_coin {
            Resource::Coin(coin) => (coin.utxo_id, coin.amount),
            _ => panic!(),
        };

        // Configure inputs and outputs to send coins from the predicate root to another address
        // The predicate allows to spend its tokens if `ask_amount` is sent to the receiver.
        let coin = Coin {
            //TODO
            amount: if partial_fullfill_params.is_some() {
                partial_fullfill_params.clone().unwrap().2
            } else {
                amount0
            },
            block_created: 0,
            asset_id: asset0,
            utxo_id: predicate_coin_utxo_id,
            maturity: 0,
            owner: predicate.address().clone(),
            status: fuels::types::coin::CoinStatus::default(),
        };
        let input_predicate = Input::ResourcePredicate {
            resource: Resource::Coin(coin),
            code: predicate_code.clone().into(),
            data: predicate.data().clone(),
        };

        // Asked asset coin belonging to the wallet taking the order
        let coin = Coin {
            amount: swap_coin_amount,
            block_created: 0,
            asset_id: asset1,
            utxo_id: swap_coin_utxo_id,
            maturity: 0,
            owner: wallet.address().clone(),
            status: fuels::types::coin::CoinStatus::default(),
        };
        let input_from_taker = Input::ResourceSigned {
            resource: Resource::Coin(coin),
            witness_index: 0,
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

        // Partial fulfill output
        // Output
        let partial_fulfill_output = Output::Coin {
            to: if partial_fullfill_params.is_some() {
                Address::from(partial_fullfill_params.clone().unwrap().0.address())
            } else {
                *order_owner_address
            },
            amount: if partial_fullfill_params.is_some() {
                partial_fullfill_params.clone().unwrap().2 - amount0
            } else {
                0
            },
            asset_id: asset0,
        };

        let script_call = ScriptCallHandler::new(
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
            partial_fulfill_output,
            output_asked_change,
        ])
        .tx_params(TxParameters::default().set_gas_price(1));

        script_call.call().await
    }

    pub async fn create_order(
        wallet: &WalletUnlocked,
        _id: String,
        predicate: &Predicate,
        asset0: &TokenContract<WalletUnlocked>,
        amount0: u64,
        _asset1: &TokenContract<WalletUnlocked>,
        _amount1: u64,
    ) -> Result<(String, Vec<Receipt>), fuels::prelude::Error> {
        let asset_id = AssetId::from(*asset0.contract_id().hash());
        wallet
            .transfer(
                predicate.address(),
                amount0,
                asset_id,
                TxParameters::default(),
            )
            .await
    }

    pub async fn _cancel_order(
        predicate: &Predicate,
        wallet: &WalletUnlocked,
        asset0: AssetId,
        amount0: u64,
    ) -> Result<(String, Vec<Receipt>), fuels::prelude::Error> {
        predicate
            .transfer(wallet.address(), amount0, asset0, TxParameters::default())
            .await
    }

    pub async fn _fulfill_order(
        predicate: &Predicate,
        wallet: &WalletUnlocked,
        asset1: AssetId,
        amount1: u64,
    ) -> Result<(String, Vec<Receipt>), fuels::prelude::Error> {
        predicate
            .transfer(wallet.address(), amount1, asset1, TxParameters::default())
            .await
    }

    pub async fn build_predicate(req: HashMap<&str, String>) -> (String, Vec<u8>) {
        let client = reqwest::Client::new();
        let url = "http://localhost:8080/create";
        let res = client.post(url).json(&req).send().await.unwrap();
        let res = res.text().await.unwrap();
        let res: serde_json::Value = serde_json::from_str(&res).unwrap();
        let res = res.as_object().unwrap().clone();
        let id = res["id"].as_str().unwrap();
        let code = res["code"].as_str().unwrap();
        let code: Vec<u8> = code
            .clone()
            .split(',')
            .map(|b| b.replace("[", "").replace("]", "").parse::<u8>().unwrap())
            .collect();

        (id.to_string(), code)
    }
}
