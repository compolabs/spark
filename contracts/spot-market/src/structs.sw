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

pub enum OrderType {
    Buy: (),
    Sell: (),
}

pub struct Order {
    id: u64,
    market_id: b256,
    order_type: OrderType,
    asset0: b256,
    amount0: u64,
    asset1: b256,
    amount1: u64,
    status: Status,
    fulfilled0: u64,
    fulfilled1: u64,
    owner: Address,
    timestamp: u64,
    matcher_fee: u64,
    matcher_fee_used: u64,
}

pub struct Market {
    id: b256,
    asset0: b256,
    asset1: b256,
    admin: Address,
    paused: bool
}

pub enum Error {
    InvalidPayment: (),
    InvalidArgument: (),
    InsufficientFunds: (),
    NotEnoughDeposit: (),
    OrderIsNotFound: (),
    AccessDenied: (),
    OrderIsNotActive: (),
    OrdersDontMatchByTokens: (),
    OrdersDontMatchByPrice: (),
}
