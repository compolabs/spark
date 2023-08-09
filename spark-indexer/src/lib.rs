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
        let entry = Deposit {
            id: data.timestamp,
            timestamp: data.timestamp,
            address: data.address,
            amount: data.amount,
        };
        deposit.save();
    }

    fn handle_withdraw_event(data: WithdrawEvent) {
        info!("💸 Withdraw event \n{:#?}", data);
        let entry = Withdraw {
            id: data.timestamp,
            timestamp: data.timestamp,
            address: data.address,
            amount: data.amount,
        };
        deposit.save();
    }

    fn handle_create_order_event(data: CreateOrderEvent) {
        // todo save data.order
        // todo save CreateOrder
        info!("✨ Create order event \n{:#?}", data);
    }

    fn handle_cancel_order_event(data: CancelOrderEvent) {
        // todo save data.order
        // todo save CancelOrder
        info!("💢 Cancel order event \n{:#?}", data);
    }

    fn handle_trade_event(data: TradeEvent) {
        // todo save data.order0
        // todo save data.order1
        // todo save Trade
        info!("💟 Trade event \n{:#?}", data);
    }
}
