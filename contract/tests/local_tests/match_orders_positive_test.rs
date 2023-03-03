use fuels::prelude::BASE_ASSET_ID;
use fuels::tx::Address;
use tuple_conv::RepeatedTuple;

use crate::utils::cotracts_utils::limit_orders_utils::deploy_limit_orders_contract;
use crate::utils::cotracts_utils::limit_orders_utils::limit_orders_abi_calls::*;
use crate::utils::cotracts_utils::limit_orders_utils::LimitOrdersContract;
use crate::utils::cotracts_utils::limit_orders_utils::Order;
use crate::utils::cotracts_utils::limit_orders_utils::Status;
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

const TEST_CASES: [TestCase; 6] = [
    // 1. price_a < price_b && order_a_amount0 > order_b_amount1
    TestCase {
        // Order a: 20k USDC ➡️ 1 BTC | price: 0.00005
        order_a: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "USDC",
            amount1: 100_000_000,
            asset1: "BTC",
        },
        // Order b: 0.51 BTC ➡️ 10k USDC | price: 0.000051
        order_b: TestCaseOrder {
            amount0: 51_000_000,
            asset0: "BTC",
            amount1: 10_000_000_000,
            asset1: "USDC",
        },
    },
    // 2. price_a < price_b && order_a_amount0 == order_b_amount1
    TestCase {
        // Order a: 20k USDC ➡️ 1 BTC | price: 0.00005
        order_a: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "USDC",
            amount1: 100_000_000,
            asset1: "BTC",
        },
        // Order b: 1.02 BTC ➡️ 20k USDC | price: 0.000051
        order_b: TestCaseOrder {
            amount0: 102_000_000,
            asset0: "BTC",
            amount1: 20_000_000_000,
            asset1: "USDC",
        },
    },
    // 3. price_a < price_b && order_a_amount0 < order_b_amount1
    TestCase {
        // Order a: 10k USDC ➡️ 0.5 BTC | price: 0.00005
        order_a: TestCaseOrder {
            amount0: 10_000_000_000,
            asset0: "USDC",
            amount1: 50_000_000,
            asset1: "BTC",
        },
        // Order b: 1.02 BTC ➡️ 20k USDC | price: 0.000051
        order_b: TestCaseOrder {
            amount0: 102_000_000,
            asset0: "BTC",
            amount1: 20_000_000_000,
            asset1: "USDC",
        },
    },
    // 4. price_a == price_b && order_a_amount0 > order_b_amount1
    TestCase {
        // Order a: 20k USDC ➡️ 1 BTC | price: 0.00005
        order_a: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "USDC",
            amount1: 100_000_000,
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
    // 5. price_a == price_b && order_a_amount0 == order_b_amount1
    TestCase {
        // Order a: 20k USDC ➡️ 1 BTC | price: 0.00005
        order_a: TestCaseOrder {
            amount0: 20_000_000_000,
            asset0: "USDC",
            amount1: 100_000_000,
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
    // 6. price_a == price_b && order_a_amount0 < order_b_amount1
    TestCase {
        // Order a: 10k USDC ➡️ 0.5 BTC | price: 0.00005
        order_a: TestCaseOrder {
            amount0: 10_000_000_000,
            asset0: "USDC",
            amount1: 50_000_000,
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

        let alice_asset1_balance = alice
            .get_asset_balance(&order0_asset1.asset_id)
            .await
            .unwrap();
        let bob_asset1_balance = bob
            .get_asset_balance(&order1_asset1.asset_id)
            .await
            .unwrap();
        let matcher_eth_balance = matcher.get_asset_balance(&BASE_ASSET_ID).await.unwrap();

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

        match_orders(&matcher_instance, order_id_a, order_id_b)
            .await
            .unwrap();

        let order_a = order_by_id(&instance, order_id_a).await.unwrap().value;
        let is_order_a_completed = order_a.status == Status::Completed;

        let order_b = order_by_id(&instance, order_id_b).await.unwrap().value;
        let is_order_b_completed = order_b.status == Status::Completed;

        let order_a = order_by_id(&instance, order_id_a).await.unwrap().value;
        let order_b = order_by_id(&instance, order_id_b).await.unwrap().value;
        let order_a_expected_status = if is_order_a_completed {
            Status::Completed
        } else {
            Status::Active
        };
        let order_b_expected_status = if is_order_b_completed {
            Status::Completed
        } else {
            Status::Active
        };
        assert_eq!(order_a.status, order_a_expected_status);
        assert_eq!(order_b.status, order_b_expected_status);
        assert_eq!(
            alice
                .get_asset_balance(&order0_asset1.asset_id)
                .await
                .unwrap(),
            alice_asset1_balance + order_a.fulfilled_1
        );
        assert_eq!(
            bob.get_asset_balance(&order1_asset1.asset_id)
                .await
                .unwrap(),
            bob_asset1_balance + order_b.fulfilled_1
        );
        assert!(
            matcher.get_asset_balance(&BASE_ASSET_ID).await.unwrap()
                > matcher_eth_balance + order_a.matcher_fee_used + order_b.matcher_fee_used - 5
        );

        // println!("order_a = {:#?}", order_a);
        // println!("order_b = {:#?}", order_b);
    }

    // Trades test
    let offset = 0;
    let res = get_trades(&instance, offset).await;
    assert_eq!(res.0.unwrap().order_id, 12);

    // Get all openned orders test
    let mut orders_fetcher = OrdersFetcher::new(instance);
    orders_fetcher.fetch_all_orders().await;
    assert_eq!(orders_fetcher.orders.len(), 12);

    deposit(&alice_instance, 1000).await.unwrap();
    let args = CreatreOrderArguments {
        asset0: BASE_ASSET_ID,
        amount0: 1,
        asset1: assets.get("BTC").unwrap().contract_id,
        amount1: 1,
        matcher_fee: 1000,
    };
    create_order(&alice_instance, &args).await.unwrap().value;

    orders_fetcher.fetch_new_orders().await;
    println!(" {:#?}", orders_fetcher.orders);
    assert_eq!(orders_fetcher.orders.len(), 13);
}

struct OrdersFetcher {
    pub orders: Vec<Order>,
    instance: LimitOrdersContract,
}

impl OrdersFetcher {
    fn new(instance: LimitOrdersContract) -> OrdersFetcher {
        OrdersFetcher {
            orders: vec![],
            instance,
        }
    }
    async fn fetch_all_orders(&mut self) {
        let mut offset = 0;
        let mut orders: Vec<Order> = vec![];
        while offset == 0 || orders.last().unwrap().id > 1 {
            let batch: Vec<Order> = get_orders(&self.instance, offset)
                .await
                .to_vec()
                .into_iter()
                .filter(|o| o.is_some())
                .map(|o| o.unwrap())
                .collect();
            orders.extend(batch);
            offset += 10;
        }
        self.orders = orders;
    }
    async fn fetch_new_orders(&mut self) {
        let mut offset = 0;
        let mut orders: Vec<Order> = self.orders.clone();
        let first_order_id = orders.first().unwrap().id; //can be NONE
        loop {
            println!("loop");
            let mut batch: Vec<Option<Order>> = get_orders(&self.instance, offset).await.to_vec();
            let mut contains_first_order_id = false;
            batch.clone().into_iter().for_each(|o| {
                if o.is_some() && o.unwrap().id == first_order_id {
                    contains_first_order_id = true;
                }
            });
            batch = batch
                .into_iter()
                .filter(|o| o.is_some() && o.as_ref().unwrap().id > first_order_id)
                .collect();
            let mut batch: Vec<Order> = batch.into_iter().map(|o| o.unwrap()).collect();
            batch.extend(orders.clone());
            orders = batch;
            if contains_first_order_id {
                break;
            }
            offset += 10;
        }
        self.orders = orders;
    }
    // async fn update_active_orders(&mut self) {
    //     let active_orders: Vec<Order> = self
    //         .orders
    //         .clone()
    //         .into_iter()
    //         .filter(|o| o.status == Status::Active)
    //         .collect();
    //     let mut i: u64 = 0;
    //     while i < ((active_orders.len() / 10) as f64).ceil() as u64 {

            
    //     }
    // }
}
