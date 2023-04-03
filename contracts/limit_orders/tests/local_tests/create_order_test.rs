use fuels::tx::Address;

use crate::utils::cotracts_utils::limit_orders_utils::limit_orders_abi_calls::{
    create_order, deposit, order_by_id, CreatreOrderArguments,
};
use crate::utils::cotracts_utils::limit_orders_utils::{deploy_limit_orders_contract, Status};
use crate::utils::cotracts_utils::token_utils::{token_abi_calls, TokenContract};
use crate::utils::local_tests_utils::*;

#[tokio::test]
async fn create_order_test() {
    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = wallets[0].clone();
    let alice = wallets[1].clone();
    let alice_address = Address::from(alice.address());
    // let bob = wallets[2].clone();
    // let bob_address = Address::from(bob.address());
    // let chad = wallets[3].clone();
    // let chad_address = Address::from(chad.address());
    // let matcher = wallets[4].clone();
    // let matcher_address = Address::from(chad.address());

    //--------------- TOKENS ---------------
    let assets = init_tokens(&admin).await;
    let usdc = assets.get("USDC").unwrap();
    let usdc_instance = TokenContract::new(usdc.contract_id.into(), admin.clone());
    let uni = assets.get("UNI").unwrap();
    // let uni_instance = TokenContract::new(uni.contract_id.into(), admin.clone());

    //--------------- THE TEST ---------
    let instance = deploy_limit_orders_contract(&admin).await;

    assert!(order_by_id(&instance, 0).await.is_err());
    assert!(order_by_id(&instance, 1).await.is_err());

    let args = CreatreOrderArguments {
        asset0: usdc.asset_id,
        amount0: 10_000_000,
        asset1: uni.contract_id,
        amount1: 5_000_000_000,
        matcher_fee: 1000,
    };

    token_abi_calls::mint_and_transfer(&usdc_instance, args.amount0, alice_address).await;
    let usdc_balance = alice.get_asset_balance(&usdc.asset_id).await.unwrap();

    let alice_instance = instance.with_wallet(alice.clone()).unwrap();
    assert!(create_order(&alice_instance, &args).await.is_err());
    deposit(&alice_instance, 2000).await.unwrap();

    let order_id = create_order(&alice_instance, &args).await.unwrap().value;
    assert_eq!(order_id, 1);

    assert!(alice.get_asset_balance(&usdc.asset_id).await.unwrap() == usdc_balance - args.amount0);

    let order = order_by_id(&instance, order_id).await.unwrap().value;
    assert!(order.amount_0 == args.amount0);
    assert!(order.status == Status::Active);
}
