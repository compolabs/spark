extern crate alloc;
use fuel_indexer_utils::prelude::*;
use fuel_indexer_utils::uid;

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
            asset0: Address::from(event.market.asset_0.0).to_string(),
            asset1: Address::from(event.market.asset_1.0).to_string(),
            admin: event.market.admin,
            paused: event.market.paused,
        };

        entry.save();
    }

    fn handle_order_change_event(event: OrderChangeEvent) {
        info!("✨ Ørder change event \n{:#?}", event);
        let order_entry = OrderEntity {
            id: uid(event.order.id.to_be_bytes()),
            market: uid(&event.order.market_id.0),
            order_type: match event.order.order_type {
                OrderType::Sell => String::from("Sell"),
                OrderType::Buy => String::from("Buy"),
            },
            asset0: Address::from(event.order.asset_0.0).to_string(),
            amount0: event.order.amount_0,
            asset1: Address::from(event.order.asset_1.0).to_string(),
            amount1: event.order.amount_1,
            status: match event.order.status {
                Status::Active => String::from("Active"),
                Status::Canceled => String::from("Canceled"),
                Status::Completed => String::from("Completed"),
            },
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
        let entry = TradeEntity::new(
            event.timestamp,
            event.address,
            uid(event.order_0_id.to_be_bytes()),
            uid(event.order_1_id.to_be_bytes()),
            Address::from(event.asset_0.0).to_string(),
            event.amount_0,
            Address::from(event.asset_1.0).to_string(),
            event.amount_1,
        );
        entry.save();
    }
}
