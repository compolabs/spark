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
    asset0: b256,
    amount0: u64,
    asset1: b256,
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
