use std::fs;
use std::thread::sleep;
use std::time::Duration;

use fuels::tx::Address;

use crate::utils::cotracts_utils::limit_orders_utils::deploy_limit_orders_contract;
use crate::utils::cotracts_utils::limit_orders_utils::limit_orders_abi_calls::*;
use crate::utils::cotracts_utils::limit_orders_utils::Order;
use crate::utils::cotracts_utils::limit_orders_utils::Status;
use crate::utils::cotracts_utils::token_utils::token_abi_calls::mint_and_transfer;
use crate::utils::cotracts_utils::token_utils::TokenContract;
use crate::utils::local_tests_utils::*;
use crate::utils::orders_fetcher::OrdersFetcher;

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

const TEST_CASES: [TestCase; 18] = [
    // 1. price_a < price_b && order_a_amount0 > order_b_amount1
    TestCase {
        // Order a: 200 USDT ➡️ 0.01 WETH
        order_a: TestCaseOrder {
            amount0: 200_000_000,
            asset0: "USDC",
            amount1: 10_000_000,
            asset1: "UNI",
        },
        // Order b: 100 USDT ➡️ 0.0051 WETH
        order_b: TestCaseOrder {
            amount0: 5_100_000,
            asset0: "UNI",
            amount1: 100_000_000,
            asset1: "USDC",
        },
    },
    // 2. price_a < price_b && order_a_amount0 == order_b_amount1
    TestCase {
        // Order a: 200 USDT ➡️ 0.01 WETH
        order_a: TestCaseOrder {
            amount0: 200_000_000,
            asset0: "USDC",
            amount1: 10_000_000,
            asset1: "UNI",
        },
        // Order b: 200 USDT ➡️ 0.0102 WETH
        order_b: TestCaseOrder {
            amount0: 10_200_000,
            asset0: "UNI",
            amount1: 200_000_000,
            asset1: "USDC",
        },
    },
    // 3. price_a < price_b && order_a_amount0 < order_b_amount1
    TestCase {
        // Order a: 100 USDT ➡️ 0.005 WETH
        order_a: TestCaseOrder {
            amount0: 100_000_000,
            asset0: "USDC",
            amount1: 5_000_000,
            asset1: "UNI",
        },
        // Order b: 200 USDT ➡️ 0.0102 WETH
        order_b: TestCaseOrder {
            amount0: 10_200_000,
            asset0: "UNI",
            amount1: 200_000_000,
            asset1: "USDC",
        },
    },
    // 4. price_a == price_b && order_a_amount0 > order_b_amount1
    TestCase {
        // Order a: 200 USDT ➡️ 0.01 WETH
        order_a: TestCaseOrder {
            amount0: 200_000_000,
            asset0: "USDC",
            amount1: 10_000_000,
            asset1: "UNI",
        },
        // Order b: 100 USDT ➡️ 0.005 WETH
        order_b: TestCaseOrder {
            amount0: 5_000_000,
            asset0: "UNI",
            amount1: 100_000_000,
            asset1: "USDC",
        },
    },
    // 5. price_a == price_b && order_a_amount0 == order_b_amount1
    TestCase {
        // Order a: 200 USDT ➡️ 0.01 WETH
        order_a: TestCaseOrder {
            amount0: 200_000_000,
            asset0: "USDC",
            amount1: 10_000_000,
            asset1: "UNI",
        },
        // Order b: 200 USDT ➡️ 0.01 WETH
        order_b: TestCaseOrder {
            amount0: 10_000_000,
            asset0: "UNI",
            amount1: 200_000_000,
            asset1: "USDC",
        },
    },
    // 6. price_a == price_b && order_a_amount0 < order_b_amount1
    TestCase {
        // Order a: 100 USDT ➡️ 0.005 WETH
        order_a: TestCaseOrder {
            amount0: 100_000_000,
            asset0: "USDC",
            amount1: 5_000_000,
            asset1: "UNI",
        },
        // Order b: 200 USDT ➡️ 0.01 WETH
        order_b: TestCaseOrder {
            amount0: 10_000_000,
            asset0: "UNI",
            amount1: 200_000_000,
            asset1: "USDC",
        },
    },
    //7
    TestCase {
        order_a: TestCaseOrder {
            amount0: 15_000_000_000,
            asset0: "USDC",
            amount1: 75_000_000,
            asset1: "UNI",
        },
        order_b: TestCaseOrder {
            amount0: 60_000_000,
            asset0: "UNI",
            amount1: 12_000_000_000,
            asset1: "USDC",
        },
    },
    //8
    TestCase {
        order_a: TestCaseOrder {
            amount0: 15_000_000_000,
            asset0: "USDC",
            amount1: 75_000_000,
            asset1: "UNI",
        },
        order_b: TestCaseOrder {
            amount0: 90_000_000,
            asset0: "UNI",
            amount1: 18_000_000_000,
            asset1: "USDC",
        },
    },
    TestCase {
        order_a: TestCaseOrder {
            amount0: 12_000_000_000,
            asset0: "USDC",
            amount1: 60_000_000,
            asset1: "UNI",
        },
        order_b: TestCaseOrder {
            amount0: 120_000_000,
            asset0: "UNI",
            amount1: 24_000_000_000,
            asset1: "USDC",
        },
    },
    TestCase {
        order_a: TestCaseOrder {
            amount0: 10_000_000_000,
            asset0: "USDC",
            amount1: 50_000_000,
            asset1: "UNI",
        },
        order_b: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "UNI",
            amount1: 40_000_000,
            asset1: "USDC",
        },
    },
    TestCase {
        order_a: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "USDC",
            amount1: 100_000_000,
            asset1: "UNI",
        },
        order_b: TestCaseOrder {
            amount0: 100_000_000,
            asset0: "UNI",
            amount1: 20_000_000_000,
            asset1: "USDC",
        },
    },
    TestCase {
        order_a: TestCaseOrder {
            amount0: 10_000_000_000,
            asset0: "USDC",
            amount1: 50_000_000,
            asset1: "UNI",
        },
        order_b: TestCaseOrder {
            amount0: 100_000_000,
            asset0: "UNI",
            amount1: 20_000_000_000,
            asset1: "USDC",
        },
    },
    TestCase {
        order_a: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "USDC",
            amount1: 102_000_000,
            asset1: "UNI",
        },
        order_b: TestCaseOrder {
            amount0: 50_000_000,
            asset0: "UNI",
            amount1: 10_000_000_000,
            asset1: "USDC",
        },
    },
    TestCase {
        order_a: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "USDC",
            amount1: 102_000_000,
            asset1: "UNI",
        },
        order_b: TestCaseOrder {
            amount0: 50_000_000,
            asset0: "UNI",
            amount1: 10_000_000_000,
            asset1: "USDC",
        },
    },
    TestCase {
        order_a: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "USDC",
            amount1: 102_000_000,
            asset1: "UNI",
        },
        order_b: TestCaseOrder {
            amount0: 100_000_000,
            asset0: "UNI",
            amount1: 20_000_000_000,
            asset1: "USDC",
        },
    },
    TestCase {
        order_a: TestCaseOrder {
            amount0: 10_000_000_000,
            asset0: "USDC",
            amount1: 51_000_000,
            asset1: "UNI",
        },
        order_b: TestCaseOrder {
            amount0: 100_000_000,
            asset0: "UNI",
            amount1: 20_000_000_000,
            asset1: "USDC",
        },
    },
    TestCase {
        order_a: TestCaseOrder {
            amount0: 15_000_000_000,
            asset0: "USDC",
            amount1: 75_000_000,
            asset1: "UNI",
        },
        order_b: TestCaseOrder {
            amount0: 60_000_000,
            asset0: "UNI",
            amount1: 12_000_000_000,
            asset1: "USDC",
        },
    },
    TestCase {
        // Order a: 200 USDT ➡️ 0.01 WETH
        order_a: TestCaseOrder {
            amount0: 200_000,
            asset0: "USDC",
            amount1: 4_000_000,
            asset1: "UNI",
        },
        // Order b: 200 USDT ➡️ 0.0102 WETH
        order_b: TestCaseOrder {
            amount0: 98_000_000,
            asset0: "UNI",
            amount1: 4_900_000,
            asset1: "USDC",
        },
    },
];

#[tokio::test]
async fn match_orders_positive_test() {
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

    //--------------- Positive test cases ---------

    let instance = deploy_limit_orders_contract(&admin).await;
    let alice_instance = instance.with_wallet(alice.clone()).unwrap();
    let bob_instance = instance.with_wallet(bob.clone()).unwrap();
    let matcher_instance = instance.with_wallet(matcher.clone()).unwrap();

    // let mut counter = 0;
    for test_case in TEST_CASES {
        // counter += 1;
        // println!("Test case #{counter}");

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
        create_order(&alice_instance, &a_args).await.unwrap().value;

        let b_args = CreatreOrderArguments {
            asset0: order1_asset0.asset_id,
            amount0: test_case.order_b.amount0,
            asset1: order1_asset1.contract_id,
            amount1: test_case.order_b.amount1,
            matcher_fee: 1000,
        };
        create_order(&bob_instance, &b_args).await.unwrap().value;
    }

    let mut orders_fetcher = OrdersFetcher::new(instance);
    orders_fetcher.fetch_all_orders().await;

    let tokens_json_str =
        fs::read_to_string("tests/tokens.json").expect("Should have been able to read the file");
    let tokens: serde_json::Value = serde_json::from_str(tokens_json_str.as_str()).unwrap();
    let tokens = tokens.as_array().unwrap();
    let mut loop_index = 0;
    while loop_index < 3 {
        orders_fetcher.update_active_orders().await;
        orders_fetcher.fetch_new_orders().await;
        let mut orders: Vec<Order> = orders_fetcher
            .orders
            .clone()
            .into_iter()
            .filter(|o| o.status == Status::Active)
            .collect();
        let mut i = 0;
        'a_order_cycle: while i < orders.len() {
            let order_a = &orders[i].clone();
            let mut j = 0;

            while j < orders.len() {
                let order_b = orders[j].clone();
                let price_a = order_a.amount_1 as f64 / order_a.amount_0 as f64;
                let price_b = order_b.amount_0 as f64 / order_b.amount_1 as f64;
                if order_a.asset_0 == order_b.asset_1
                    && order_a.asset_1 == order_b.asset_0
                    && price_a <= price_b
                    && order_a.status == Status::Active
                    && order_b.status == Status::Active
                {
                    let res = match_orders(&matcher_instance, order_a.id, order_b.id).await;
                    // let asset0 = tokens
                    //     .into_iter()
                    //     .find(|t| t["symbol"].as_str().unwrap() == "USDC");
                    // let asset1 = tokens
                    //     .into_iter()
                    //     .find(|t| t["symbol"].as_str().unwrap() == "UNI");
                    // let a_symbol = asset0.unwrap()["symbol"].as_str().unwrap();
                    // let b_symbol = asset1.unwrap()["symbol"].as_str().unwrap();
                    assert!(res.is_ok());
                    if res.is_ok() {
                        orders[i].status = Status::Completed;
                        orders[j].status = Status::Completed;

                        // println!(
                        //     "Match 👩‍❤️‍👨!\n Order {}: {} {a_symbol} ➡️ {} {b_symbol}\n Order {}: {} {b_symbol} ➡️ {} {a_symbol}\n\n",
                        //     order_a.id,
                        //     order_a.amount_0,
                        //     order_a.amount_1,
                        //     order_b.id,
                        //     order_b.amount_0,
                        //     order_b.amount_1,
                        // );
                        continue 'a_order_cycle;
                    } else {
                        // println!(
                        //     "Error ❌\n Order {}: {}{a_symbol} ➡️ {}{b_symbol}\n Order {}: {}{b_symbol} ➡️ {}{a_symbol}\n{:#}\n",
                        //     order_a.id,
                        //     order_a.amount_0,
                        //     order_a.amount_1,
                        //     order_b.id,
                        //     order_b.amount_0,
                        //     order_b.amount_1,
                        //     res.err().unwrap()
                        // );
                    }
                }
                j += 1;
            }
            i += 1;
        }
        sleep(Duration::from_secs(30));
        loop_index += 1;
    }
}
