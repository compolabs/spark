use std::collections::HashMap;

use fuels::accounts::predicate::Predicate;

use crate::utils::{
    cotracts_utils::limit_orders_utils::limit_orders_interactions::build_predicate,
    local_tests_utils::init_wallets, print_title,
};

#[tokio::test]
async fn predicate_build_test() {
    print_title("Predicate build Test");
    //--------------- WALLETS ---------------
    let wallets: Vec<fuels::prelude::WalletUnlocked> = init_wallets().await;
    let alice = &wallets[1];

    //--------------- PREDICATE ---------

    let mut req = HashMap::new();
    req.insert(
        "asset0",
        String::from("0x56fb8789a590ea9c12af6fe6dc2b43f347700b049d4f823fd4476c6f366af201"),
    );
    req.insert("amount0", String::from("450000"));
    req.insert(
        "asset1",
        String::from("0xf7d6d3344dd36493d7e6b02b16a679778ad24539e2698af02558868a6f2feb81"),
    );
    req.insert("amount1", String::from("100000"));
    req.insert(
        "owner",
        String::from("0x01e6ca3495713e0f076f4c761a3d5f20c052fb44fe81bdfda57006de293b082b"),
    );

    println!("Backend Request Json = {:?}\n", req);

    let (id, code) = build_predicate(req).await;
    println!("Backend Response = id:{id}, code:{:?}\n", code);

    let predicate: Predicate =
        Predicate::from_code(code.clone().into()).with_provider(alice.provider().unwrap().clone());
    println!("address = {:?}", predicate.address());
}
