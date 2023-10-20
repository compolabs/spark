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
// start_block: 5209704
// 0x..   = 0xe06f9223c5be21e37b76c073d50dab19c997c4b37d9246ffe9b4de930b8fee73
// fuel.. = "fuel1upheyg79hcs7x7mkcpea2rdtr8ye039n0kfydllfkn0fxzu0aeesmgvscf"

const RPC: &str = "beta-4.fuel.network";
const CONTRACT_ADDRESS: &str = "0xe06f9223c5be21e37b76c073d50dab19c997c4b37d9246ffe9b4de930b8fee73";

const ADDRESS: &str = "fuel1r9xy6hfjr63mct58zz054pjjpttqlyjfnrm8qp75slfuczkvghfqs6ndle";
const INVITES_AMOUNT: u64 = 10;
const NASTED_MAX_INVITES: u64 = 3;

#[tokio::test]
async fn accrue_invitations() {
    dotenv::dotenv().ok();
    let provider = Provider::connect(RPC).await.unwrap();
    let secret = std::env::var("ADMIN").unwrap();
    let wallet =
        WalletUnlocked::new_from_private_key(secret.parse().unwrap(), Some(provider.clone()));

    let id = ContractId::from_str(CONTRACT_ADDRESS).unwrap();
    let inctance: ReferalContract<WalletUnlocked> = ReferalContract::new(id.clone(), wallet.clone());
    let address = Bech32Address::from_str(ADDRESS).unwrap();
    inctance
        .methods()
        .accrue_invitations(address.clone(), INVITES_AMOUNT, NASTED_MAX_INVITES)
        .tx_params(TxParameters::default().with_gas_price(1))
        .call()
        .await
        .unwrap();

    let (invites_left, nasted_max_invites) = inctance
        .methods()
        .verify(address)
        .simulate()
        .await
        .unwrap()
        .value;
    println!("invites_left = {invites_left} nasted_max_invites = {nasted_max_invites}");
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

    let (invites_left, _) = bob_instance
        .verify(bob.address())
        .simulate()
        .await
        .unwrap()
        .value;
    assert_eq!(invites_left, 1);
    assert!(chad_instance
        .verify(chad.address())
        .simulate()
        .await
        .is_err());
    let res = chad_instance.chekin(bob.address()).call().await;
    assert!(res.is_ok() && res.unwrap().value);
    let (invites_left, _) = chad_instance
        .verify(chad.address())
        .simulate()
        .await
        .unwrap()
        .value;
    assert_eq!(invites_left, 1);
    assert!(jack_instance
        .verify(jack.address())
        .simulate()
        .await
        .is_err());
    assert!(jack_instance.chekin(bob.address()).call().await.is_err());
    assert!(jack_instance.chekin(chad.address()).call().await.is_err());
}
