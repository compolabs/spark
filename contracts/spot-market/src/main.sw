contract;
mod structs;
mod events;
mod utils;

use structs::*;
use events::*;
use utils::*;

use std::auth::{AuthError, msg_sender};
use std::block::timestamp;
use std::call_frames::msg_asset_id;
use std::constants::BASE_ASSET_ID;
use std::context::msg_amount;
use std::logging::log;
use std::revert::require;
use std::storage::storage_vec::*;
use std::token::transfer_to_address;
use std::hash::Hash;

configurable {}

storage {
    orders: StorageMap<u64, Order> = StorageMap {},
    orders_amount: u64 = 0,
    deposits: StorageMap<Address, u64> = StorageMap {},
}

abi OrderBookContract {

// ## Deposit and Withdraw of fee
// Users can deposit money to paing fees into their accounts. This fees is necessary to motivate matching engine, and also to pay protocol fees

    #[payable, storage(read, write)]
    fn deposit();

    #[storage(read, write)]
    fn withdraw(amount: u64);

    #[storage(read)]
    fn get_deposit(address: Address) -> u64;


// ## Create order
// This function allows users to create order. It requires a deposit to be matched

    #[payable, storage(read, write)]
    fn create_order(asset1: b256, amount1: u64, matcher_fee: u64) -> u64;


// ## Modify order
// todo not sure hwo that should work

    //todo implemement
    #[storage(read, write)]
    fn modify_order(id: u64);


// ## Close order
// Users can close one or multiple orders, unused fee will be returned to the user's balacne
   
    #[storage(read, write)]
    fn cancel_order(id: u64);
    
    //todo implemement
    #[storage(read, write)]
    fn cancel_all_orders();


// ## Order getters
// Allow to get info about orders and orderbook via dry-runs
   
    //? get_total_ordes_amount in the sheet
    #[storage(read)] 
    fn orders_amount() -> u64;

    #[storage(read)]
    fn order_by_id(id: u64) -> Order;

// ## Match orders
// This function is used by the Matching Engines to partially or completely close two orders against each other.
   
    #[storage(read, write)]
    fn match_orders(order_id_a: u64, order_id_b: u64);


// ## Fulfill orders
// Allows you to close a specific order without having to create a new one
    // todo implemement as an feature
   
    #[payable, storage(read, write)]
    fn fulfill_order(id: u64);

}

impl OrderBookContract for Contract {

// ## Deposit and Withdraw of fee
// Users can deposit money to paing fees into their accounts. This fees is necessary to motivate matching engine, and also to pay protocol fees

    #[payable, storage(read, write)]
    fn deposit() {
        let amount = msg_amount();
        let caller = msg_sender_address();
        require(amount > 0 && msg_asset_id() == BASE_ASSET_ID, Error::InvalidPayment);
        let deposit = storage.deposits.get(caller).try_read().unwrap_or(0);
        storage.deposits.insert(caller, deposit + amount);
    }

    #[storage(read, write)]
    fn withdraw(amount: u64) {
        let caller = msg_sender_address();
        let deposit = storage.deposits.get(caller).try_read().unwrap_or(0);
        require(amount <= deposit, Error::InsufficientFunds);
        storage.deposits.insert(caller, deposit - amount);
        transfer_to_address(caller, BASE_ASSET_ID, deposit - amount);
    }

    #[storage(read)]
    fn get_deposit(address: Address) -> u64 {
        storage.deposits.get(address).try_read().unwrap_or(0)
    }

// ## Create order
// This function allows users to create order. It requires a deposit to be matched

    #[payable, storage(read, write)]
    fn create_order(asset1: b256, amount1: u64, matcher_fee: u64) -> u64 {
        let asset0 = msg_asset_id().value;
        let amount0 = msg_amount();
        let caller = msg_sender_address();
        let deposit = storage.deposits.get(caller).try_read().unwrap_or(0);
        require(amount0 > 0, Error::InvalidPayment);
        require(amount1 > 0, Error::InvalidArgument);
        require(deposit >= matcher_fee, Error::NotEnoughDeposit);
        let id = storage.orders_amount.try_read().unwrap_or(0) + 1;

        let order = Order {
            asset0,
            amount0,
            asset1,
            amount1,
            fulfilled0: 0,
            fulfilled1: 0,
            status: Status::Active,
            id,
            timestamp: timestamp(),
            owner: caller,
            matcher_fee,
            matcher_fee_used: 0,
        };

        storage.orders_amount.write(order.id);
        storage.orders.insert(order.id, order);
        storage.deposits.insert(caller, deposit - matcher_fee);
        
        log(OrderChangeEvent{timestamp: timestamp(), address: caller, order});

        id
    }


// ## Modify order
// todo not sure hwo that should work

    //todo implemement
    #[storage(read, write)]
    fn modify_order(id: u64){}


// ## Close order
// Users can close one or multiple orders, unused fee will be returned to the user's balacne
   
    #[storage(read, write)]
    fn cancel_order(id: u64) {
        let order = storage.orders.get(id).try_read();
        require(id > 0 && order.is_some(), Error::OrderIsNotFound);
        let mut order = order.unwrap();

        let deposit = storage.deposits.get(order.owner).try_read().unwrap_or(0);
        require(msg_sender_address() == order.owner, Error::AccessDenied);
        require(order.status.is_active(), Error::OrderIsNotActive);

        order.status = Status::Canceled;
        storage.orders.insert(id, order);
        storage.deposits.insert(order.owner, deposit + order.matcher_fee - order.matcher_fee_used);
        transfer_to_address(order.owner, AssetId::from(order.asset0), order.amount0 - order.fulfilled0);

        log(OrderChangeEvent{ timestamp: timestamp(), address: order.owner, order });
    }
    
    //todo implemement
    #[storage(read, write)]
    fn cancel_all_orders(){}


// ## Order getters
// Allow to get info about orders and orderbook via dry-runs
   
    #[storage(read)]
    fn orders_amount() -> u64 {
        storage.orders_amount.try_read().unwrap_or(0)
    }

    #[storage(read)]
    fn order_by_id(id: u64) -> Order {
        let order = storage.orders.get(id).try_read();
        require(order.is_some(), Error::OrderIsNotFound);
        order.unwrap()
    }



// ## Match orders
// This function is used by the Matching Engines to partially or completely close two orders against each other.
   
    #[storage(read, write)]
    fn match_orders(order0_id: u64, order1_id: u64){
        let matcher = msg_sender_address();
        let order0 = storage.orders.get(order0_id).try_read();
        let order1 = storage.orders.get(order1_id).try_read();
        require(order0.is_some() && order1.is_some(), Error::OrderIsNotFound);
        
        let mut order0 = order0.unwrap();
        let mut order1 = order1.unwrap();

        require(order0.status.is_active() && order1.status.is_active(), Error::OrderIsNotActive);
        require(order0.asset0 == order1.asset1 && order0.asset1 == order1.asset0, Error::OrdersDontMatchByTokens);
        let price_0 = order0.amount1 * 10_000_000 / order0.amount0;
        let price_1 = order1.amount0 * 10_000_000 / order1.amount1;
        require(price_0 <= price_1, Error::OrdersDontMatchByPrice);

        let order0_amount0_left = order0.amount0 - order0.fulfilled0;
        let order0_amount1_left = order0.amount1 - order0.fulfilled1;
        let order0_matcher_fee_left = order0.matcher_fee - order0.matcher_fee_used;

        let order1_amount0_left = order1.amount0 - order1.fulfilled0;
        let order1_amount1_left = order1.amount1 - order1.fulfilled1;
        let order1_matcher_fee_left = order1.matcher_fee - order1.matcher_fee_used;
        let trade_time = timestamp();
        let mut trade0 = TradeEvent {
            timestamp: trade_time,
            address: matcher,
            order0_id: order0.id,
            order1_id: order1.id,
            asset0: order0.asset0,
            amount0: 0,
            asset1: order0.asset1,
            amount1: 0,
        };

        let mut trade1 = TradeEvent {
            timestamp: trade_time,
            address: matcher,
            order0_id: order0.id,
            order1_id: order1.id,
            asset0: order1.asset0,
            amount0: 0,
            asset1: order1.asset1,
            amount1: 0,
        };

        if order0_amount0_left >= order1_amount1_left {
            // Transfer order1_amount1 from order0 to order1
            order0.fulfilled0 += order1_amount1_left;
            order1.fulfilled1 += order1_amount1_left;
            trade0.amount0 = order1_amount1_left;
            trade1.amount1 = order1_amount1_left;
            transfer_to_address(order1.owner, AssetId::from(order1.asset1), order1_amount1_left);
            order1.status = Status::Completed;

            // Transfer order0_fulfill_percent * order0_amount1 / 100 from order1 to order0
            let order0_fulfill_percent = order1_amount1_left * 100_000 / order0_amount0_left;
            let order0_fulfill_amount = order0_fulfill_percent * order0_amount1_left / 100_000;
            order1.fulfilled0 += order0_fulfill_amount;
            order0.fulfilled1 += order0_fulfill_amount;
            trade1.amount0 = order0_fulfill_amount;
            trade0.amount1 = order0_fulfill_amount;
            transfer_to_address(order0.owner, AssetId::from(order0.asset1), order0_fulfill_amount);
            if order0_fulfill_percent == 100_000 {
                order0.status = Status::Completed;
            }

            // Transfer order1_amount0 - order0_fulfill_percent * order0_amount1 / 100 from order1 to order1.owner 
            let cashback = order1_amount0_left - order0_fulfill_amount;
            if cashback > 0 {
                order1.fulfilled0 += cashback;
                transfer_to_address(order1.owner, AssetId::from(order1.asset0), cashback);
            }

            // Mathcer fee
            let order0_matcher_fee = order0_matcher_fee_left * order0_fulfill_percent / 100_000;
            order0.matcher_fee_used += order0_matcher_fee;
            order1.matcher_fee_used += order1_matcher_fee_left;
            transfer_to_address(matcher, BASE_ASSET_ID, order0_matcher_fee + order1_matcher_fee_left);
        } else {
            // Transfer order0_amount0 from order0 to order1
            order0.fulfilled0 += order0_amount0_left;
            order1.fulfilled1 += order0_amount0_left;
            trade0.amount0 = order0_amount0_left;
            trade1.amount1 = order0_amount0_left;
            transfer_to_address(order1.owner, AssetId::from(order0.asset0), order0_amount0_left);
            // Transfer order0_amount1 from order1 to order0
            order0.fulfilled1 += order0_amount1_left;
            order1.fulfilled0 += order0_amount1_left;
            trade0.amount1 = order0_amount1_left;
            trade1.amount0 = order0_amount1_left;
            transfer_to_address(order0.owner, AssetId::from(order0.asset1), order0_amount1_left);
            order0.status = Status::Completed;

            // Transfer order1_amount0 * order1_fulfill_percent - order0_amount1 (a: 0.01 BTC, b: 0 BTC) from order1 to order1.owner 
            let order1_fulfill_percent = order0_amount0_left * 100_000 / order1_amount1_left;
            if order1_amount0_left * order1_fulfill_percent / 100_000 > order0_amount1_left
            {
                let cashback = order1_amount0_left * order1_fulfill_percent / 100_000 - order0_amount1_left;
                order1.fulfilled0 += cashback;
                transfer_to_address(order1.owner, AssetId::from(order1.asset0), cashback);
            }
            // Matcher fee
            let order0_matcher_fee = order0.matcher_fee - order0.matcher_fee_used;
            order0.matcher_fee_used += order0_matcher_fee;
            let order1_matcher_fee = order1_matcher_fee_left * order1_fulfill_percent / 100_000;
            order1.matcher_fee_used += order1_matcher_fee;
            transfer_to_address(matcher, BASE_ASSET_ID, order0_matcher_fee + order1_matcher_fee);
        }
        //fixme
        // if order0.status.is_completed() {
        //     log(trade0);
        // }
        // if order1.status.is_completed() {
        //     log(trade1);   
        // }

        // storage.trades.push(trade0);
        // storage.trades.push(trade1);
        let time = timestamp();
        // log(OrderChangeEvent{ timestamp: time, address: matcher, order: order0 }); //fixme
        // log(OrderChangeEvent{ timestamp: time, address: matcher, order: order1 }); //fixme
        //---------
        log(MatchEvent{ 
            order0: OrderChangeEvent{ timestamp: time, address: matcher, order: order0 },
            order1: OrderChangeEvent{ timestamp: time, address: matcher, order: order1 },
            trade0: if order0.status.is_completed() {Option::Some(trade0)}else{Option::None},
            trade1: if order1.status.is_completed() {Option::Some(trade1)}else{Option::None}
        });
        //---------
        storage.orders.insert(order0.id, order0);
        storage.orders.insert(order1.id, order1);
        // (trade0, trade1)
    }


// ## Fulfill orders
// Allows you to close a specific order without having to create a new one
    // todo implemement as an feature
   
    #[payable, storage(read, write)]
    fn fulfill_order(id: u64) {}

}
