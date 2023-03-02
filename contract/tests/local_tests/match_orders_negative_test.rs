use fuels::tx::Address;

use crate::utils::cotracts_utils::limit_orders_utils::deploy_limit_orders_contract;
use crate::utils::cotracts_utils::limit_orders_utils::limit_orders_abi_calls::*;
use crate::utils::cotracts_utils::token_utils::token_abi_calls::mint_and_transfer;
use crate::utils::cotracts_utils::token_utils::TokenContract;
use crate::utils::local_tests_utils::*;

struct TestCaseOrder {
    amount0: u64,
    asset0: &'static str,
    amount1: u64,
    asset1: &'static str,
}
struct TestCase {
    order_a: TestCaseOrder,
    order_b: TestCaseOrder,
}

const TEST_CASES: [TestCase; 4] = [
    // 1. price_a > price_b && order_a_amount0 > order_b_amount1 | Price of order 1 is too much
    TestCase {
        // Order a: 20k USDT ➡️ 1.02 BTC | price: 0.00005
        order_a: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "USDC",
            amount1: 102_000_000,
            asset1: "BTC",
        },
        // Order b: 0.5 BTC ➡️ 10k USDC | price: 0.00005
        order_b: TestCaseOrder {
            amount0: 50_000_000,
            asset0: "BTC",
            amount1: 10_000_000_000,
            asset1: "USDC",
        },
    },
    // 2. price_a > price_b && order_a_amount0 == order_b_amount1 | Price of order 1 is too much
    TestCase {
        // Order a: 20k USDC ➡️ 1.02 BTC | price: 0.000051
        order_a: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "USDC",
            amount1: 102_000_000,
            asset1: "BTC",
        },
        // Order b: 1 BTC ➡️ 20k USDC | price: 0.00005
        order_b: TestCaseOrder {
            amount0: 100_000_000,
            asset0: "BTC",
            amount1: 20_000_000_000,
            asset1: "USDC",
        },
    },
    // 3. price_a > price_b && order_a_amount0 < order_b_amount1 | Price of order 1 is too much
    TestCase {
        // Order a: 10k USDC ➡️ 0.51 BTC | price: 0.000051
        order_a: TestCaseOrder {
            amount0: 10_000_000_000,
            asset0: "USDC",
            amount1: 51_000_000,
            asset1: "BTC",
        },
        // Order b: 1 BTC ➡️ 20k USDC | price: 0.00005
        order_b: TestCaseOrder {
            amount0: 100_000_000,
            asset0: "BTC",
            amount1: 20_000_000_000,
            asset1: "USDC",
        },
    },
    // 4. order_a.asset0 != order_b.asset1 | Orders don't match by tokens
    TestCase {
        // Order a: 20k USDC ➡️ 1 BTC
        order_a: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "USDC",
            amount1: 1_00_000_000,
            asset1: "BTC",
        },
        // Order b: 1 BTC ➡️ 4k UNI
        order_b: TestCaseOrder {
            amount0: 1_00_000_000,
            asset0: "BTC",
            amount1: 4_000_000_000,
            asset1: "UNI",
        },
    },
];

#[tokio::test]
async fn match_orders_negative_test() {
    //--------------- WALLETS ---------------
    let wallets = init_wallets().await;
    let admin = wallets[0].clone();
    let alice = wallets[1].clone();
    let alice_address = Address::from(alice.address());
    let bob = wallets[2].clone();
    let bob_address = Address::from(bob.address());
    let matcher = wallets[4].clone();

    //--------------- TOKENS ---------------
    let assets = init_tokens(&admin).await;

    //--------------- Negative test cases ---------

    let instance = deploy_limit_orders_contract(&admin).await;
    let alice_instance = instance.with_wallet(alice.clone()).unwrap();
    let bob_instance = instance.with_wallet(bob.clone()).unwrap();
    let matcher_instance = instance.with_wallet(matcher.clone()).unwrap();

    let mut counter = 0;
    for test_case in TEST_CASES {
        counter += 1;
        println!("Test case #{counter}");

        let order0_asset0 = assets.get(test_case.order_a.asset0).unwrap();
        let order0_asset1 = assets.get(test_case.order_a.asset1).unwrap();
        let order0_asset0_instance =
            TokenContract::new(order0_asset0.contract_id.into(), admin.clone());
        let order1_asset0 = assets.get(test_case.order_b.asset0).unwrap();
        let order1_asset1 = assets.get(test_case.order_b.asset1).unwrap();
        let order1_asset0_instance =
            TokenContract::new(order1_asset0.contract_id.into(), admin.clone());

        deposit(&alice_instance, 1000).await.unwrap();
        deposit(&bob_instance, 1000).await.unwrap();
        mint_and_transfer(
            &order0_asset0_instance,
            test_case.order_a.amount0,
            alice_address,
        )
        .await;
        mint_and_transfer(
            &order1_asset0_instance,
            test_case.order_b.amount0,
            bob_address,
        )
        .await;

        let a_args = CreatreOrderArguments {
            asset0: order0_asset0.asset_id,
            amount0: test_case.order_a.amount0,
            asset1: order0_asset1.contract_id,
            amount1: test_case.order_a.amount1,
            matcher_fee: 1000,
        };
        let order_id_a = create_order(&alice_instance, &a_args).await.unwrap().value;

        let b_args = CreatreOrderArguments {
            asset0: order1_asset0.asset_id,
            amount0: test_case.order_b.amount0,
            asset1: order1_asset1.contract_id,
            amount1: test_case.order_b.amount1,
            matcher_fee: 1000,
        };
        let order_id_b = create_order(&bob_instance, &b_args).await.unwrap().value;

        let res = match_orders(&matcher_instance, order_id_a, order_id_b).await;
        println!("{:#?}", res.err().unwrap());
    }
}
