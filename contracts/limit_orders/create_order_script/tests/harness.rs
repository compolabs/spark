use fuels::{
    prelude::*,
    types::{coin::Coin, input::Input, resource::Resource},
};
use std::str::FromStr;

// Load abi from json
abigen!(
    Script(
        name = "CreateOrderScript",
        abi = "out/debug/create_order_script-abi.json"
    ),
    Contract(
        name = "LimitOrdersContarct",
        abi = "../out/debug/limit_orders-abi.json"
    )
);

const RPC: &str = "beta-3.fuel.network";
const SECRET: &str = "";
const CONTRACT: &str = "0x7662a02959e3e2d681589261e95a7a4bc8ac66c6d66999a0fe01bb6c36ada7c6";
const BTC_ASSET_ID: &str = "0xf7d6d3344dd36493d7e6b02b16a679778ad24539e2698af02558868a6f2feb81";
const USDC_ASSET_ID: &str = "0x56fb8789a590ea9c12af6fe6dc2b43f347700b049d4f823fd4476c6f366af201";

#[tokio::test]
async fn test() {
    let provider = Provider::connect(RPC).await.unwrap();
    let wallet =
        WalletUnlocked::new_from_private_key(SECRET.parse().unwrap(), Some(provider.clone()));
    let bin_path = "out/debug/create_order_script.bin";

    let script_instance = CreateOrderScript::new(wallet.clone(), bin_path);
    let asset0 = ContractId::from_str(BTC_ASSET_ID).unwrap();
    let amount0: u64 = 10000; //1000000
    let asset1: ContractId = ContractId::from_str(USDC_ASSET_ID).unwrap();
    let amount1: u64 = 2000000; // 2300000000

    let contarct_id = Bech32ContractId::from(ContractId::from_str(CONTRACT).unwrap());
    let contract_instance = LimitOrdersContarct::new(contarct_id, wallet.clone());
    let contracts: [&dyn SettableContract; 1] = [&contract_instance];

    let filter = ResourceFilter {
        from: wallet.address().clone(),
        asset_id: AssetId::from(*asset0),
        amount: 1,
        ..Default::default()
    };
    let coin = &provider.get_spendable_resources(filter).await.unwrap()[0];
    let (coin_utxo_id, _) = match coin {
        Resource::Coin(coin) => (coin.utxo_id, coin.amount),
        _ => panic!(),
    };
    let coin = Coin {
        amount: amount0,
        block_created: 0,
        asset_id: AssetId::from(*asset0),
        utxo_id: coin_utxo_id,
        maturity: 0,
        owner: wallet.address().clone(),
        status: fuels::types::coin::CoinStatus::default(),
    };
    let input = Input::ResourceSigned {
        resource: Resource::Coin(coin),
        witness_index: 0,
    };

    let _result = script_instance
        .main(asset0, amount0, asset1, amount1)
        .tx_params(TxParameters::default().set_gas_price(1))
        .with_inputs(vec![input])
        .set_contracts(&contracts)
        .call()
        .await
        .unwrap();
}
