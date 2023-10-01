contract;
mod structs;

use structs::*;
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

abi LimitOrders {

// ## Deposit and Withdraw of fee
// Users can deposit money to paing fees into their accounts. This fees is necessary to motivate matching engine, and also to pay protocol fees

    #[payable]
    #[storage(read, write)]
    fn deposit();

    #[storage(read, write)]
    fn withdraw(amount: u64);

    #[storage(read)]
    fn get_deposit(address: Address) -> u64;


// ## Create order
// This function allows users to create order. It requires a deposit to be matched

    #[payable, storage(read, write)]
    fn create_order(asset1: AssetId, amount1: u64, matcher_fee: u64) -> u64;


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

    //todo implemement
    #[storage(read)]
    fn get_mark_price() -> u64;

    //todo implemement
    #[storage(read)]
    fn get_all_pending_funding_payment() -> u64;
    
    //todo implemement
    #[storage(read)]
    fn get_market_price();



// ## Match orders
// This function is used by the Matching Engines to partially or completely close two orders against each other.
   
    #[storage(read, write)]
    fn match_orders(order_id_a: u64, order_id_b: u64);


// ## Fulfill orders
// Allows you to close a specific order without having to create a new one
    // todo implemement as an feature
   
    // #[payable, storage(read, write)]
    // fn fulfill_order(id: u64);

}

storage {
    orders: StorageMap<u64, Order> = StorageMap {},
    orders_amount: u64 = 0,
    deposits: StorageMap<Address, u64> = StorageMap {},
}

fn get_sender_or_throw() -> Address {
    match msg_sender().unwrap() {
        Identity::Address(addr) => addr,
        _ => revert(0),
    }
}

// fn is_order_active(order: Order) -> bool {
//     match order.status {
//         Status::Active => true,
//         _ => false,
//     }
// }

impl LimitOrders for Contract {
    #[storage(read)]
    fn get_deposit(address: Address) -> u64 {
        storage.deposits.get(address).try_read().unwrap_or(0)
    }

    #[storage(read)]
    fn orders_amount() -> u64 {
        storage.orders_amount.try_read().unwrap_or(0)
    }

    #[storage(read)]
    fn order_by_id(id: u64) -> Order {
        let order = storage.orders.get(id).try_read();
        require(order.is_some(), "Order is not found");
        order.unwrap()
    }

    #[payable]
    #[storage(read, write)]
    fn deposit() {
        let amount = msg_amount();
        let caller = get_sender_or_throw();
        require(amount > 0 && msg_asset_id() == BASE_ASSET_ID, "Invalid payment");
        let deposit = storage.deposits.get(caller).try_read().unwrap_or(0);
        storage.deposits.insert(caller, deposit + amount);
        
        log(DepositEvent{
            timestamp: timestamp(),
            address: caller,
            amount: amount,
        });
    }

    #[storage(read, write)]
    fn withdraw(amount: u64) {
        let caller = get_sender_or_throw();
        let deposit = storage.deposits.get(caller).try_read().unwrap_or(0);
        require(amount <= deposit, "Insufficient funds");
        storage.deposits.insert(caller, deposit - amount);
        transfer_to_address(caller, BASE_ASSET_ID, deposit - amount);

        log(WithdrawEvent{
            timestamp: timestamp(),
            address: caller,
            amount: amount,
        });
    }

    #[payable]
    #[storage(read, write)]
    fn create_order(asset1: AssetId, amount1: u64, matcher_fee: u64) -> u64 {
        let asset0 = msg_asset_id();
        let amount0 = msg_amount();
        let caller = get_sender_or_throw();
        let deposit = storage.deposits.get(caller).try_read().unwrap_or(0);
        require(amount0 > 0 && amount1 > 0, "Amount cannot be less then 1");
        require(deposit >= matcher_fee, "Not enough deposit");
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
        
        log(CreateOrderEvent{
            timestamp: timestamp(),
            address: caller,
            order,
        });

        id
    }

    #[storage(read, write)]
    fn cancel_order(id: u64) {
        let order = storage.orders.get(id).try_read();
        require(id > 0 && order.is_some(), "Order is not found");
        let mut order = order.unwrap();

        let deposit = storage.deposits.get(order.owner).try_read().unwrap_or(0);
        require(get_sender_or_throw() == order.owner, "Access denied");
        require(order.status.is_active(), "The order isn't active");

        order.status = Status::Canceled;
        storage.orders.insert(id, order);
        storage.deposits.insert(order.owner, deposit + order.matcher_fee - order.matcher_fee_used);
        transfer_to_address(order.owner, order.asset0, order.amount0 - order.fulfilled0);

        log(CancelOrderEvent{
            timestamp: timestamp(),
            address: order.owner,
            order,
        });
    }

    #[storage(read, write)]
    fn match_orders(order0_id: u64, order1_id: u64){
        let matcher = get_sender_or_throw();
        let order0 = storage.orders.get(order0_id).try_read();
        let order1 = storage.orders.get(order1_id).try_read();
        require(order0.is_some(), "Order 0 is not found");
        require(order1.is_some(), "Order 1 is not found");
        let mut order0 = order0.unwrap();
        let mut order1 = order1.unwrap();

        require(order0.status.is_active() && order1.status.is_active(), "Orders shuold be active");
        require(order0.asset0 == order1.asset1 && order0.asset1 == order1.asset0, "Orders don't match by tokens");
        let price_0 = order0.amount1 * 10_000_000 / order0.amount0;
        let price_1 = order1.amount0 * 10_000_000 / order1.amount1;
        require(price_0 <= price_1, "Price of order 1 is too much");

        let order0_amount0_left = order0.amount0 - order0.fulfilled0;
        let order0_amount1_left = order0.amount1 - order0.fulfilled1;
        let order0_matcher_fee_left = order0.matcher_fee - order0.matcher_fee_used;

        let order1_amount0_left = order1.amount0 - order1.fulfilled0;
        let order1_amount1_left = order1.amount1 - order1.fulfilled1;
        let order1_matcher_fee_left = order1.matcher_fee - order1.matcher_fee_used;

        let mut trade0 = TradeEvent {
            timestamp: timestamp(),
            address: matcher,
            order0: order0,
            order1: order1,
            asset0: order0.asset0,
            amount0: 0,
            asset1: order0.asset1,
            amount1: 0,
        };

        let mut trade1 = TradeEvent {
            timestamp: timestamp(),
            address: matcher,
            order0: order0,
            order1: order1,
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
            transfer_to_address(order1.owner, order1.asset1, order1_amount1_left);
            order1.status = Status::Completed;

            // Transfer order0_fulfill_percent * order0_amount1 / 100 from order1 to order0
            let order0_fulfill_percent = order1_amount1_left * 100_000 / order0_amount0_left;
            let order0_fulfill_amount = order0_fulfill_percent * order0_amount1_left / 100_000;
            order1.fulfilled0 += order0_fulfill_amount;
            order0.fulfilled1 += order0_fulfill_amount;
            trade1.amount0 = order0_fulfill_amount;
            trade0.amount1 = order0_fulfill_amount;
            transfer_to_address(order0.owner, order0.asset1, order0_fulfill_amount);
            if order0_fulfill_percent == 100_000 {
                order0.status = Status::Completed;
            }

            // Transfer order1_amount0 - order0_fulfill_percent * order0_amount1 / 100 from order1 to order1.owner 
            let cashback = order1_amount0_left - order0_fulfill_amount;
            if cashback > 0 {
                order1.fulfilled0 += cashback;
                transfer_to_address(order1.owner, order1.asset0, cashback);
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
            transfer_to_address(order1.owner, order0.asset0, order0_amount0_left);
            // Transfer order0_amount1 from order1 to order0
            order0.fulfilled1 += order0_amount1_left;
            order1.fulfilled0 += order0_amount1_left;
            trade0.amount1 = order0_amount1_left;
            trade1.amount0 = order0_amount1_left;
            transfer_to_address(order0.owner, order0.asset1, order0_amount1_left);
            order0.status = Status::Completed;

            // Transfer order1_amount0 * order1_fulfill_percent - order0_amount1 (a: 0.01 BTC, b: 0 BTC) from order1 to order1.owner 
            let order1_fulfill_percent = order0_amount0_left * 100_000 / order1_amount1_left;
            if order1_amount0_left * order1_fulfill_percent / 100_000 > order0_amount1_left
            {
                let cashback = order1_amount0_left * order1_fulfill_percent / 100_000 - order0_amount1_left;
                order1.fulfilled0 += cashback;
                transfer_to_address(order1.owner, order1.asset0, cashback);
            }
            // Matcher fee
            let order0_matcher_fee = order0.matcher_fee - order0.matcher_fee_used;
            order0.matcher_fee_used += order0_matcher_fee;
            let order1_matcher_fee = order1_matcher_fee_left * order1_fulfill_percent / 100_000;
            order1.matcher_fee_used += order1_matcher_fee;
            transfer_to_address(matcher, BASE_ASSET_ID, order0_matcher_fee + order1_matcher_fee);
        }
        if order0.status.is_completed() {
            trade0.order0 = order0;
            trade0.order1 = order1;
            log(trade0);
        }
        if order1.status.is_completed() {
            trade1.order0 = order0;
            trade1.order1 = order1;
            log(trade1);   
        }
        // storage.trades.push(trade0);
        // storage.trades.push(trade1);
        storage.orders.insert(order0.id, order0);
        storage.orders.insert(order1.id, order1);
        // (trade0, trade1)
    }


    // #[payable]
    // #[storage(read, write)]
    // fn fulfill_order(id: u64) {
    //     let mut order = storage.orders.get(id);
    //     require(id > 0 && order.is_some(), "Order is not found");
    //     let mut order = storage.orders.get(id).unwrap();

    //     let payment_asset = msg_asset_id();
    //     let payment_amount = msg_amount();

    //     require(is_order_active(order), "The order isn't active");
    //     require(payment_amount > 0 && payment_asset == order.asset1, "Invalid payment");

    //     let amount0_left = order.amount0 - order.fulfilled0;
    //     let amount1_left = order.amount1 - order.fulfilled1;
    //     let caller = get_sender_or_throw();

    //     let mut trade = Trade {
    //         order_id: id,
    //         asset0: order.asset0,
    //         amount0: 0,
    //         asset1: order.asset1,
    //         amount1: 0,
    //         timestamp: timestamp(),
    //     };

    //     //If paid more than amount1 - close the order and give cashback
    //     if (payment_amount >= amount1_left) { 
    //         // Give the caller asset1 difference like cashback
    //         transfer_to_address(payment_amount - amount1_left, order.asset1, caller); 
    //         //The caller will receive asset0 how much is left
    //         transfer_to_address(amount0_left, order.asset0, caller); 
    //         // The owner will receive asset1 how much is left
    //         transfer_to_address(amount1_left, order.asset1, order.owner);
    //         order.fulfilled0 += amount0_left;
    //         order.fulfilled1 += amount1_left;
    //         trade.amount0 = amount0_left;
    //         trade.amount1 = amount1_left;
    //         order.status = Status::Completed;
    //         storage.orders.insert(id, order);
    //         let deposit = storage.deposits.get(order.owner).unwrap_or(0);
    //         storage.deposits.insert(order.owner, deposit + order.matcher_fee - order.matcher_fee_used);
    //     }
    //     //If payed less - close order partially
    //     else {
    //         let amount0 = (order.amount0 * (payment_amount / order.amount1));
    //         //The owner will receive payment_amount1
    //         transfer_to_address(payment_amount, order.asset1, order.owner); 
    //         //The caller will receive a piece of amount0 floored to integer
    //         transfer_to_address(order.amount0, order.asset0, caller);

    //         order.fulfilled0 += amount0;
    //         order.fulfilled1 += payment_amount;
    //         trade.amount0 = amount0;
    //         trade.amount1 = payment_amount;
    //         storage.orders.insert(id, order);
    //         //FIXME handle matcher fee
    //     }

    //     storage.trades.push(trade);
    // }
}
