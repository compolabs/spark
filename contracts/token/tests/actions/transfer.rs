use crate::{
    actions::setup::setup,
    utils::{format_units, parse_units},
};
use fuels::prelude::*;
use std::str::FromStr;

const TOKEN_ADDRESS: &str = "";
const RECIPIEND_ADDRES: &str = "";

#[tokio::test]
async fn transfer() {
    let (wallet, dapp, provider) = setup().await;
    let decimals = dapp.methods().decimals().simulate().await.unwrap().value;
    let symbol = dapp.methods().symbol().simulate().await.unwrap().value;
    let asset_id = AssetId::from_str(TOKEN_ADDRESS).unwrap();

    println!("Decimals: {decimals}\nSymbol: {symbol}");

    let balance = wallet.get_asset_balance(&asset_id).await.unwrap();
    println!(
        "Wallet balance: {} {symbol}",
        format_units(balance, decimals)
    );

    let recipient = Bech32Address::from_str(RECIPIEND_ADDRES).unwrap();
    let recipient = Wallet::from_address(recipient, Some(provider.clone()));

    let amount = parse_units(10, decimals);
    let _receipts = wallet
        .transfer(
            recipient.address(),
            amount,
            asset_id,
            TxParameters::new(Some(1), Some(100000_000000), None),
        )
        .await
        .unwrap();

    let recipient_balance = recipient.get_asset_balance(&asset_id).await.unwrap();
    let balance = wallet.get_asset_balance(&asset_id).await.unwrap();
    println!(
        "Wallet balance: {} {symbol}\nRecipient balance: {} {symbol}",
        format_units(balance, decimals),
        format_units(recipient_balance, decimals),
    )
}
