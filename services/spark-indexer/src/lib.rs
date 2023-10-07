extern crate alloc;
use fuel_indexer_utils::prelude::*;
use fuel_indexer_utils::uid;

#[indexer(manifest = "spark_indexer.manifest.yaml")]
pub mod spark_indexer_index_mod {

    fn handle_block(block: BlockData) {
        let txs = block.transactions.len();
        info!("🧱 Block height: {} | transacrions: {txs}", block.height);
    }

    fn handle_deposit_change_event(event: DepositChangeEvent) {
        info!("💰 Deposit change event \n{:#?}", event);
        let entry = DepositEntity {
            id: uid(&event.address),
            address: event.address,
            amount: event.amount,
        };
        entry.save();
    }

    fn handle_order_change_event(event: OrderChangeEvent) {
        info!("✨ Ørder change event \n{:#?}", event);
        let order_entry = OrderEntity {
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
            event.asset_0.0.into(),
            event.amount_0,
            event.asset_1.0.into(),
            event.amount_1,
        );
        entry.save();
    }

    // fn handle_trade_event(data: TradeEvent) {
    //     info!("💟 Trade event \n{:#?}", data);

    //     let order_entry_0 = OrderEntity {
    //         id: uid(data.timestamp.into()),
    //         asset0: data.order_0.asset_0.0.into(),
    //         amount0: data.order_0.amount_0,
    //         asset1: data.order_0.asset_1.0.into(),
    //         amount1: data.order_0.amount_1,
    //         status: match data.order_0.status {
    //             Status::Active => String::from("Active"),
    //             Status::Canceled => String::from("Canceled"),
    //             Status::Completed => String::from("Completed"),
    //         },
    //         fulfilled0: data.order_0.fulfilled_0,
    //         fulfilled1: data.order_0.fulfilled_1,
    //         owner: data.order_0.owner,
    //         timestamp: data.order_0.timestamp,
    //         matcher_fee: data.order_0.matcher_fee,
    //         matcher_fee_used: data.order_0.matcher_fee_used,
    //     };

    //     let order_entry_1 = OrderEntity {
    //         id: uid(data.timestamp.into()),
    //         asset0: data.order_1.asset_0.0.into(),
    //         amount0: data.order_1.amount_0,
    //         asset1: data.order_1.asset_1.0.into(),
    //         amount1: data.order_1.amount_1,
    //         status: match data.order_1.status {
    //             Status::Active => String::from("Active"),
    //             Status::Canceled => String::from("Canceled"),
    //             Status::Completed => String::from("Completed"),
    //         },
    //         fulfilled0: data.order_1.fulfilled_0,
    //         fulfilled1: data.order_1.fulfilled_1,
    //         owner: data.order_1.owner,
    //         timestamp: data.order_1.timestamp,
    //         matcher_fee: data.order_1.matcher_fee,
    //         matcher_fee_used: data.order_1.matcher_fee_used,
    //     };
    //     order_entry_0.save();
    //     order_entry_1.save();

    //     let entry = TradeEntity {
    //         id: uid(data.timestamp.into()),
    //         timestamp: data.timestamp,
    //         address: data.address,
    //         orderEntity0: order_entry_0.id,
    //         orderEntity1: order_entry_1.id,

    //         asset0: data.asset_0.0.into(),
    //         amount0: data.amount_0,
    //         asset1: data.asset_1.0.into(),
    //         amount1: data.amount_1,
    //     };
    //     entry.save();
    // }
}
