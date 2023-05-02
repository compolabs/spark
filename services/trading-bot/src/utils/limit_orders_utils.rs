use fuels::prelude::abigen;
use fuels::prelude::TxParameters;

abigen!(Contract(
    name = "LimitOrdersContract",
    abi = "src/artefacts/limit_orders-abi.json"
));

pub mod limit_orders_abi_calls {

    use fuels::{
        prelude::{CallParameters, WalletUnlocked, BASE_ASSET_ID},
        programs::call_response::FuelCallResponse,
        types::ContractId,
    };

    use super::*;

    // pub async fn get_deposit_by_address(contract: &LimitOrdersContract, address: Address) -> u64 {
    //     contract
    //         .methods()
    //         .get_deposit_by_address(address)
    //         .simulate()
    //         .await
    //         .unwrap()
    //         .value
    // }

    // pub async fn orders_amount(contract: &LimitOrdersContract) -> u64 {
    //     contract
    //         .methods()
    //         .orders_amount()
    //         .simulate()
    //         .await
    //         .unwrap()
    //         .value
    // }

    // pub async fn orders_by_id(
    //     contract: &LimitOrdersContract<WalletUnlocked>,
    //     ids: [u64; 10],
    // ) -> (
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    // ) {
    //     contract
    //         .methods()
    //         .orders_by_id(ids)
    //         .simulate()
    //         .await
    //         .unwrap()
    //         .value
    // }

    // pub async fn get_trades(
    //     contract: &LimitOrdersContract,
    //     offset: u64,
    // ) -> (
    //     Option<Trade>,
    //     Option<Trade>,
    //     Option<Trade>,
    //     Option<Trade>,
    //     Option<Trade>,
    //     Option<Trade>,
    //     Option<Trade>,
    //     Option<Trade>,
    //     Option<Trade>,
    //     Option<Trade>,
    // ) {
    //     contract
    //         .methods()
    //         .trades(offset)
    //         .simulate()
    //         .await
    //         .unwrap()
    //         .value
    // }
    // pub async fn get_orders(
    //     contract: &LimitOrdersContract<WalletUnlocked>,
    //     offset: u64,
    // ) -> (
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    //     Option<Order>,
    // ) {
    //     let res = contract.clone().methods().orders(offset).simulate().await;
    //     res.unwrap().value
    // }

    // pub async fn order_by_id(
    //     contract: &LimitOrdersContract,
    //     id: u64,
    // ) -> Result<FuelCallResponse<Order>, fuels::prelude::Error> {
    //     contract.methods().order_by_id(id).simulate().await
    // }

    pub async fn deposit(
        contract: &LimitOrdersContract<WalletUnlocked>,
        amount: u64,
    ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
        let call_params = CallParameters::default()
            .set_amount(amount)
            .set_asset_id(BASE_ASSET_ID);
        contract
            .methods()
            .deposit()
            .tx_params(TxParameters::default().set_gas_price(1))
            .call_params(call_params)
            .unwrap()
            .call()
            .await
    }
    // pub async fn withdraw(
    //     contract: &LimitOrdersContract,
    //     amount: u64,
    // ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
    //     let tx_params = TxParameters::new(Some(100), Some(100_000_000), Some(0));
    //     contract
    //         .methods()
    //         .withdraw(amount)
    //         .tx_params(tx_params)
    //         // .append_variable_outputs(1)
    //         .call()
    //         .await
    // }

    pub struct CreatreOrderArguments {
        pub asset0: fuels::tx::AssetId,
        pub amount0: u64,
        pub asset1: ContractId,
        pub amount1: u64,
        pub matcher_fee: u64,
    }

    pub async fn create_order(
        contract: &LimitOrdersContract<WalletUnlocked>,
        args: &CreatreOrderArguments,
    ) -> Result<FuelCallResponse<u64>, fuels::prelude::Error> {
        let call_params = CallParameters::default()
            .set_amount(args.amount0)
            .set_asset_id(args.asset0);
        contract
            .methods()
            .create_order(args.asset1, args.amount1, args.matcher_fee)
            .tx_params(TxParameters::default().set_gas_price(1))
            .call_params(call_params)
            .unwrap()
            .call()
            .await
    }

    // pub async fn cancel_order(
    //     contract: &LimitOrdersContract,
    //     id: u64,
    // ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
    //     let tx_params = TxParameters::new(Some(100), Some(100_000_000), Some(0));
    //     contract
    //         .methods()
    //         .cancel_order(id)
    //         .tx_params(tx_params)
    //         .append_variable_outputs(1)
    //         .call()
    //         .await
    // }

    // pub struct FulfillOrderArguments {
    //     pub id: u64,
    //     pub amount1: u64,
    //     pub asset1: fuels::tx::AssetId,
    // }

    // pub async fn fulfill_order(
    //     contract: &LimitOrdersContract,
    //     args: &FulfillOrderArguments,
    // ) -> Result<FuelCallResponse<()>, fuels::prelude::Error> {
    //     let call_params = CallParameters::new(Some(args.amount1), Some(args.asset1), None);
    //     let tx_params = TxParameters::new(Some(100), Some(100_000_000), Some(0));
    //     contract
    //         .methods()
    //         .fulfill_order(args.id)
    //         .tx_params(tx_params)
    //         .call_params(call_params)
    //         // .unwrap()
    //         .append_variable_outputs(2)
    //         .append_variable_outputs(1)
    //         .call()
    //         .await
    // }
    // pub async fn match_orders(
    //     contract: &LimitOrdersContract<WalletUnlocked>,
    //     order_id_a: u64,
    //     order_id_b: u64,
    // ) -> Result<FuelCallResponse<(Trade, Trade)>, fuels::prelude::Error> {
    //     let tx_params = TxParameters::default().set_gas_price(1);
    //     contract
    //         .methods()
    //         .match_orders(order_id_a, order_id_b)
    //         .tx_params(tx_params)
    //         .append_variable_outputs(4)
    //         .append_message_outputs(4)
    //         .call()
    //         .await
    // }
}
