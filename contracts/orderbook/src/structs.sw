library;

pub enum Status {
    Active: (),
    Canceled: (),
    Completed: (),
}

impl Status {
    pub fn is_active(self) -> bool {
        match self {
            Status::Active => true,
            _ => false,
        }
    }
    pub fn is_canceled(self) -> bool {
        match self {
            Status::Canceled => true,
            _ => false,
        }
    }
    pub fn is_completed(self) -> bool {
        match self {
            Status::Completed => true,
            _ => false,
        }
    }
}

pub struct Order {
    asset0: AssetId,
    amount0: u64,
    asset1: AssetId,
    amount1: u64,
    status: Status,
    fulfilled0: u64,
    fulfilled1: u64,
    owner: Address,
    id: u64,
    timestamp: u64,
    matcher_fee: u64,
    matcher_fee_used: u64,
}

pub struct Trade {
    asset0: AssetId,
    amount0: u64,
    asset1: AssetId,
    amount1: u64,
}

//events
pub struct DepositEvent{
    timestamp: u64,
    address: Address,
    amount: u64,
}

pub struct WithdrawEvent{
    timestamp: u64,
    address: Address,
    amount: u64,
}

pub struct CreateOrderEvent{
    timestamp: u64,
    address: Address,
    order: Order
}

pub struct CancelOrderEvent{
    timestamp: u64,
    address: Address,
    order: Order
}

pub struct TradeEvent{
    timestamp: u64,
    address: Address,
    order0: Order,
    order1: Order,
    
    asset0: AssetId,
    amount0: u64,
    asset1: AssetId,
    amount1: u64,
}