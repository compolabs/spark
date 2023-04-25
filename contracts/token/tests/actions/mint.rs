use fuels::prelude::*;
use std::str::FromStr;
use crate::{actions::setup::setup, utils::format_units};

const USDT_ADDRESS: &str = "0x2cffcbc96717e5a102db1d5da45c189248d00a070cd65a822096b9733d3b071e";

#[tokio::test]
async fn mint() {
    let (wallet, dapp, _) = setup().await;
    let decimals = dapp.methods().decimals().simulate().await.unwrap().value;
    let symbol = dapp.methods().symbol().simulate().await.unwrap().value;
    let mint_amount = dapp.methods().get_mint_amount().simulate().await.unwrap();
    let asset_id = AssetId::from_str(USDT_ADDRESS).unwrap();

    println!(
        "Decimals: {decimals}\nSymbol: {symbol}\nMint amount: {} {symbol}",
        format_units(mint_amount.value, decimals)
    );

    let balance = wallet.get_asset_balance(&asset_id).await.unwrap();
    println!(
        "Wallet balance: {} {symbol}",
        format_units(balance, decimals)
    );
    let params = TxParameters::new(Some(1), Some(1000000), None);
    let result = dapp
        .methods()
        .mint()
        .append_variable_outputs(1)
        .tx_params(params)
        .call()
        .await;
    println!("{} Mint", if result.is_ok() { "✅" } else { "❌" });

    let balance = wallet.get_asset_balance(&asset_id).await.unwrap();
    println!(
        "Wallet balance: {} {symbol}",
        format_units(balance, decimals)
    )
}
