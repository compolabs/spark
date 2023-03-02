use std::str::FromStr;

use fuels::tx::{Address, AssetId};

use crate::utils::cotracts_utils::limit_orders_utils::limit_orders_abi_calls::*;
use crate::utils::cotracts_utils::limit_orders_utils::{deploy_limit_orders_contract, Status};
use crate::utils::cotracts_utils::token_utils::{token_abi_calls, TokenContract};
use crate::utils::local_tests_utils::*;

#[tokio::test]
async fn fulfill_order_test() {
    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = wallets[0].clone();
    let alice = wallets[1].clone();
    let alice_address = Address::from(alice.address());
    let bob = wallets[2].clone();
    let bob_address = Address::from(bob.address());

    //--------------- TOKENS ---------------
    let assets = init_tokens(&admin).await;
    let usdc = assets.get("USDC").unwrap();
    let usdc_instance = TokenContract::new(usdc.contract_id.into(), admin.clone());
    let uni = assets.get("UNI").unwrap();
    let uni_instance = TokenContract::new(uni.contract_id.into(), admin.clone());

    //--------------- THE TEST ---------
    let instance = deploy_limit_orders_contract(&admin).await;

    assert!(order_by_id(&instance, 0).await.is_err());
    assert!(order_by_id(&instance, 1).await.is_err());

    let create_order_args = CreatreOrderArguments {
        asset0: usdc.asset_id,
        amount0: 10_000_000,
        asset1: uni.contract_id,
        amount1: 5_000_000_000,
        matcher_fee: 1000,
    };

    token_abi_calls::mint_and_transfer(&usdc_instance, create_order_args.amount0, alice_address)
        .await;

    let alice_instance = instance.with_wallet(alice.clone()).unwrap();
    assert!(create_order(&alice_instance, &create_order_args)
        .await
        .is_err());
    deposit(&alice_instance, 1000).await.unwrap();

    let order_id = create_order(&alice_instance, &create_order_args)
        .await
        .unwrap()
        .value;

    let bob_instance = instance.with_wallet(bob.clone()).unwrap();
    token_abi_calls::mint_and_transfer(&uni_instance, create_order_args.amount1, bob_address).await;

    let fulfill_order_args = FulfillOrderArguments {
        id: order_id,
        amount1: create_order_args.amount1,
        asset1: AssetId::from_str(uni.contract_id.to_string().as_str()).unwrap(),
    };
    fulfill_order(&bob_instance, &fulfill_order_args)
        .await
        .unwrap();

    let order = order_by_id(&alice_instance, order_id).await.unwrap().value;
    assert!(alice.get_asset_balance(&uni.asset_id).await.unwrap() == order.amount_1);
    assert!(bob.get_asset_balance(&usdc.asset_id).await.unwrap() == order.amount_0);
    assert!(order.status == Status::Completed);
}
