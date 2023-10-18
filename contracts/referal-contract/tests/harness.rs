use std::str::FromStr;

use fuels::{
    accounts::fuel_crypto::rand::{self, Rng},
    prelude::*,
};

// Load abi from json
abigen!(Contract(
    name = "ReferalContract",
    abi = "out/debug/referal-contract-abi.json"
));

// ✅ Contract deployed on beta-4
// start_block: 5209016
// 0x..   = 0x77ff598ab937e768d6d5deb9e17e7c9d9c141d9a0e444e143e66511b01898121
// fuel.. = "fuel1wll4nz4exlnk34k4m6u7zlnunkwpg8v6pezyu9p7veg3kqvfsyss8f80t5"

const RPC: &str = "beta-4.fuel.network";
const CONTRACT_ADDRESS: &str = "0x77ff598ab937e768d6d5deb9e17e7c9d9c141d9a0e444e143e66511b01898121";

const ADDRESS: &str = "";
const INVITES_AMOUNT: u64 = 0;
const NASTED_MAX_INVITES: u64 = 0;

#[tokio::test]
async fn accrue_invitations() {
    dotenv::dotenv().ok();
    let provider = Provider::connect(RPC).await.unwrap();
    let secret = std::env::var("ADMIN").unwrap();
    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    let id = Bech32ContractId::from_str(CONTRACT_ADDRESS).unwrap();
    let inctance = ReferalContract::new(id.clone(), wallet.clone());
    let address = Address::from_str(ADDRESS).unwrap();
    inctance
        .methods()
        .accrue_invitations(address, INVITES_AMOUNT, NASTED_MAX_INVITES)
        .tx_params(TxParameters::default().with_gas_price(1))
        .call()
        .await
        .unwrap();
}

////-----------------------------------------------------------------------------------------------------------------------------------------------------------------
////-----------------------------------------------------------------------------------------------------------------------------------------------------------------
////-----------------------------------------------------------------------------------------------------------------------------------------------------------------
// #[tokio::test]
async fn _deploy() {
    dotenv::dotenv().ok();
    let provider = Provider::connect(RPC).await.unwrap();
    let secret = std::env::var("ADMIN").unwrap();
    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    let bin_path = "out/debug/referal-contract.bin";
    let tx_params = TxParameters::default().with_gas_price(1);
    let configurables = ReferalContractConfigurables::new().with_OWNER(wallet.address().into());
    let config = LoadConfiguration::default().with_configurables(configurables);
    let mut rng = rand::thread_rng();
    let salt = rng.gen::<[u8; 32]>();
    let id = Contract::load_from(bin_path, config)
        .unwrap()
        .with_salt(salt)
        .deploy(&wallet, tx_params)
        .await
        .unwrap();

    let _ = ReferalContract::new(id.clone(), wallet.clone());

    let block = provider.latest_block_height().await.unwrap();
    println!("✅ Contract deployed on beta-4");
    println!("start_block: {block}",);
    println!("0x..   = 0x{:?}", id.hash());
    println!("fuel.. = {:?}", id.to_string());
}

#[tokio::test]
async fn main_test() {
    let config = WalletsConfig::new(Some(5), Some(1), Some(1_000_000_000));
    let wallets = launch_custom_provider_and_get_wallets(config, None, None).await;
    let admin = &wallets[0];
    let alice = &wallets[1];
    let bob = &wallets[2];
    let chad = &wallets[3];
    let jack = &wallets[4];

    let config = LoadConfiguration::default().with_configurables(
        ReferalContractConfigurables::default().with_OWNER(admin.address().into()),
    );
    let id = Contract::load_from("./out/debug/referal-contract.bin", config)
        .unwrap()
        .deploy(admin, TxParameters::default())
        .await
        .unwrap();
    let admin_instance = ReferalContract::new(id.clone(), admin.clone()).methods();
    let alice_instance = ReferalContract::new(id.clone(), alice.clone()).methods();
    let bob_instance = ReferalContract::new(id.clone(), bob.clone()).methods();
    let chad_instance = ReferalContract::new(id.clone(), chad.clone()).methods();
    let jack_instance = ReferalContract::new(id.clone(), jack.clone()).methods();

    let res = alice_instance
        .accrue_invitations(bob.address(), 1, 1)
        .call()
        .await;
    assert!(res.is_err());
    let res = alice_instance.add_admin(alice.address()).call().await;
    assert!(res.is_err());
    let res = admin_instance.add_admin(alice.address()).call().await;
    assert!(res.is_ok());
    let res = alice_instance.add_admin(bob.address()).call().await;
    assert!(res.is_err());
    let res = alice_instance
        .accrue_invitations(bob.address(), 1, 1)
        .call()
        .await;
    assert!(res.is_ok());

    let (invites_left, _) = bob_instance.verify().simulate().await.unwrap().value;
    assert_eq!(invites_left, 1);
    assert!(chad_instance.verify().simulate().await.is_err());
    let res = chad_instance.chekin(bob.address()).call().await;
    assert!(res.is_ok() && res.unwrap().value);
    let (invites_left, _) = chad_instance.verify().simulate().await.unwrap().value;
    assert_eq!(invites_left, 1);
    assert!(jack_instance.verify().simulate().await.is_err());
    assert!(jack_instance.chekin(bob.address()).call().await.is_err());
    assert!(jack_instance.chekin(chad.address()).call().await.is_err());
}
