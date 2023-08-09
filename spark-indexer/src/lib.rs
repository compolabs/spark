extern crate alloc;
use fuel_indexer_utils::prelude::*;

#[indexer(manifest = "spark_indexer.manifest.yaml")]
pub mod spark_indexer_index_mod {
    fn handle_block(block: BlockData) {
        let txs = block.transactions.len();
        info!("🧱 Block height: {} | transacrions: {txs}", block.height);
    }

    fn handle_deposit_event(data: DepositEvent) {
        info!("💰 Deposit event \n{:#?}", data);
        let entry = DepositEntity {
            id: data.timestamp,
            timestamp: data.timestamp,
            address: data.address,
            amount: data.amount,
        };
        entry.save();
    }

    fn handle_withdraw_event(data: WithdrawEvent) {
        info!("💸 Withdraw event \n{:#?}", data);
        let entry = WithdrawEntity {
            id: data.timestamp,
            timestamp: data.timestamp,
            address: data.address,
            amount: data.amount,
        };
        entry.save();
    }

    fn handle_create_order_event(data: CreateOrderEvent) {
        info!("✨ Create order event \n{:#?}", data);

        let order_entry = OrderEntity {
            id: data.order.id,
            asset0: data.order.asset_0,
            amount0: data.order.amount_0,
            asset1: data.order.asset_1,
            amount1: data.order.amount_1,
            status: match data.order.status {
                Status::Active => String::from("Active"),
                Status::Canceled => String::from("Canceled"),
                Status::Completed => String::from("Completed"),
            },
            fulfilled0: data.order.fulfilled_0,
            fulfilled1: data.order.fulfilled_1,
            owner: data.order.owner,
            timestamp: data.order.timestamp,
            matcher_fee: data.order.matcher_fee,
            matcher_fee_used: data.order.matcher_fee_used,
        };
        order_entry.save();

        let entry = CreateOrderEntity {
            id: data.timestamp,
            timestamp: data.timestamp,
            address: data.address,
            order: order_entry.id,
        };
        entry.save();
    }

    fn handle_cancel_order_event(data: CancelOrderEvent) {
        info!("💢 Cancel order event \n{:#?}", data);

        let order_entry = OrderEntity {
            id: data.order.id,
            asset0: data.order.asset_0,
            amount0: data.order.amount_0,
            asset1: data.order.asset_1,
            amount1: data.order.amount_1,
            status: match data.order.status {
                Status::Active => String::from("Active"),
                Status::Canceled => String::from("Canceled"),
                Status::Completed => String::from("Completed"),
            },
            fulfilled0: data.order.fulfilled_0,
            fulfilled1: data.order.fulfilled_1,
            owner: data.order.owner,
            timestamp: data.order.timestamp,
            matcher_fee: data.order.matcher_fee,
            matcher_fee_used: data.order.matcher_fee_used,
        };
        order_entry.save();

        let entry = CancelOrderEntity {
            id: data.timestamp,
            timestamp: data.timestamp,
            address: data.address,
            // order: order_entry.id,
        };
        entry.save();
    }

    fn handle_trade_event(data: TradeEvent) {
        info!("💟 Trade event \n{:#?}", data);

        let order_entry_0 = OrderEntity {
            id: data.order_0.id,
            asset0: data.order_0.asset_0,
            amount0: data.order_0.amount_0,
            asset1: data.order_0.asset_1,
            amount1: data.order_0.amount_1,
            status: match data.order_0.status {
                Status::Active => String::from("Active"),
                Status::Canceled => String::from("Canceled"),
                Status::Completed => String::from("Completed"),
            },
            fulfilled0: data.order_0.fulfilled_0,
            fulfilled1: data.order_0.fulfilled_1,
            owner: data.order_0.owner,
            timestamp: data.order_0.timestamp,
            matcher_fee: data.order_0.matcher_fee,
            matcher_fee_used: data.order_0.matcher_fee_used,
        };

        let order_entry_1 = OrderEntity {
            id: data.order_1.id,
            asset0: data.order_1.asset_0,
            amount0: data.order_1.amount_0,
            asset1: data.order_1.asset_1,
            amount1: data.order_1.amount_1,
            status: match data.order_1.status {
                Status::Active => String::from("Active"),
                Status::Canceled => String::from("Canceled"),
                Status::Completed => String::from("Completed"),
            },
            fulfilled0: data.order_1.fulfilled_0,
            fulfilled1: data.order_1.fulfilled_1,
            owner: data.order_1.owner,
            timestamp: data.order_1.timestamp,
            matcher_fee: data.order_1.matcher_fee,
            matcher_fee_used: data.order_1.matcher_fee_used,
        };
        order_entry_0.save();
        order_entry_1.save();

        let entry = TradeEntity {
            id: data.timestamp,
            timestamp: data.timestamp,
            address: data.address,
            // order0: order_entry_0.id,
            // order1: order_entry_1.id,

            asset0: data.asset_0,
            amount0: data.amount_0,
            asset1: data.asset_1,
            amount1: data.amount_1,
        };
        entry.save();
    }
}
