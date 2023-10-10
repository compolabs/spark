library;
use ::structs::*;


pub struct OrderChangeEvent{
    timestamp: u64,
    address: Address,
    order: Order
}

pub struct TradeEvent{
    timestamp: u64,
    address: Address,
    order0_id: u64,
    order1_id: u64,
    
    asset0: b256,
    amount0: u64,
    asset1: b256,
    amount1: u64,
}

pub struct MatchEvent{
    order0: OrderChangeEvent,
    order1: OrderChangeEvent,
    trade0: Option<TradeEvent>,
    trade1: Option<TradeEvent>,
}