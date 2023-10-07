extern crate alloc;
use fuel_indexer_utils::prelude::*;

impl From<Status> for OrderStatusLabel {
    fn from(status: Status) -> Self {
        match status {
            Status::Active => OrderStatusLabel::ACTIVE,
            Status::Canceled => OrderStatusLabel::CANCELLED,
            Status::Completed => OrderStatusLabel::COMPLETED,
        }
    }
}

impl From<OrderType> for OrderTypeLabel {
    fn from(order_type: OrderType) -> Self {
        match order_type {
            OrderType::Buy => OrderTypeLabel::BUY,
            OrderType::Sell => OrderTypeLabel::SELL,
        }
    }
}

#[indexer(manifest = "spark_indexer.manifest.yaml")]
pub mod spark_indexer_index_mod {

    fn handle_block(block: BlockData) {
        let txs = block.transactions.len();
        info!("🧱 Block height: {} | transacrions: {txs}", block.height);
    }

    fn handle_market_change_event(event: MarketChangeEvent) {
        info!("🛒 Market change event \n{:#?}", event);
        let entry = MarketEntity {
            id: uid(&event.market.id.0),
            asset0: Address::from(event.market.asset_0.0),
            asset1: Address::from(event.market.asset_1.0),
            admin: event.market.admin,
            paused: event.market.paused,
        };
        entry.save();
    }

    fn handle_order_change_event(event: OrderChangeEvent) {
        info!("✨ Ørder change event \n{:#?}", event);
        let market_id = uid(&event.order.market_id.0);

        // Ensure these actually exist
        let market = match MarketEntity::load(market_id.clone()) {
            Some(market) => market,
            None => {
                error!("Market not found: {}", market_id);
                panic!("");
            }
        };

        let order_entry = OrderEntity {
            id: uid(event.order.id.to_be_bytes()),
            market: market.id,
            order_type: OrderTypeLabel::from(event.order.order_type).into(),
            asset0: Address::from(event.order.asset_0.0),
            amount0: event.order.amount_0,
            asset1: Address::from(event.order.asset_1.0),
            amount1: event.order.amount_1,
            status: OrderStatusLabel::from(event.order.status).into(),
            fulfilled0: event.order.fulfilled_0,
            fulfilled1: event.order.fulfilled_1,
            owner: event.order.owner,
            timestamp: event.order.timestamp,
            matcher_fee: event.order.matcher_fee,
            matcher_fee_used: event.order.matcher_fee_used,
        };
        order_entry.save();
    }

    fn handle_trade_event(event: TradeEvent) {
        info!("💟 Trade event \n{:#?}", event);

        // Ensure these actually exist
        let order0 = match OrderEntity::load(uid(event.order_0_id.to_be_bytes())) {
            Some(order) => order,
            None => {
                error!("Order not found: {}", uid(event.order_0_id.to_be_bytes()));
                panic!("");
            }
        };
        let order1 = match OrderEntity::load(uid(event.order_1_id.to_be_bytes())) {
            Some(order) => order,
            None => {
                error!("Order not found: {}", uid(event.order_1_id.to_be_bytes()));
                panic!("");
            }
        };

        let entry = TradeEntity::new(
            event.timestamp,
            event.address,
            order0.id,
            order1.id,
            Address::from(event.asset_0.0),
            event.amount_0,
            Address::from(event.asset_1.0),
            event.amount_1,
        );
        entry.save();
    }
}