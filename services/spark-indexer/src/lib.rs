extern crate alloc;
use fuel_indexer_utils::prelude::*;

// const MARKETS: [(&str, &str); 3] = [("UNI", "USDC"), ("BTC", "USDC"), ("ETH", "USDC")];

#[indexer(manifest = "spark_indexer.manifest.yaml")]
pub mod spark_indexer_index_mod {

    fn handle_order_change_event(event: OrderChangeEvent, block: BlockData) {
        let entry = OrderEntity {
            id: uid(event.order.id.to_be_bytes()),
            order_id: event.order.id,
            asset0: event.order.asset_0.0.into(),
            amount0: event.order.amount_0,
            asset1: event.order.asset_1.0.into(),
            amount1: event.order.amount_1,
            status: match event.order.status {
                Status::Active => String::from("Active"),
                Status::Canceled => String::from("Canceled"),
                Status::Completed => String::from("Completed"),
            },
            fulfilled0: event.order.fulfilled_0,
            fulfilled1: event.order.fulfilled_1,
            owner: event.order.owner,
            timestamp: event.order.timestamp - (10 + (1 << 62)),
            matcher_fee: event.order.matcher_fee,
            matcher_fee_used: event.order.matcher_fee_used,
        };

        entry.save();

        let height = block.height;
        info!("✨ Spark (height: {height}): 🚀 Ørder change\n{:#?}", entry);
    }

    fn handle_trade_event(event: TradeEvent, block: BlockData) {
        let entry = TradeEntity::new(
            event.timestamp - (10 + (1 << 62)),
            event.address,
            uid(event.order_0_id.to_be_bytes()),
            uid(event.order_1_id.to_be_bytes()),
            event.asset_0.0.into(),
            event.amount_0,
            event.asset_1.0.into(),
            event.amount_1,
        );
        entry.save();

        let height = block.height;
        info!("✨ Spark (height: {height}): 🔀 Trade event \n{:#?}", entry);
    }

    fn havdle_match_event(event: MatchEvent, block: BlockData) {
        let height = block.height;
        info!("✨ Spark (height: {height}): 💟 Match event");

        self::handle_order_change_event(event.order_0, block.clone());
        self::handle_order_change_event(event.order_1, block.clone());

        if event.trade_0.is_some() {
            self::handle_trade_event(event.trade_0.unwrap(), block.clone());
        }
        if event.trade_1.is_some() {
            self::handle_trade_event(event.trade_1.unwrap(), block.clone());
        }
    }
}
