use fuels::prelude::WalletUnlocked;
use tuple_conv::RepeatedTuple;

use super::limit_orders_utils::{
    limit_orders_abi_calls::{orders_by_id, get_orders}, LimitOrdersContract, Order, Status,
};

pub struct OrdersFetcher {
    pub orders: Vec<Order>,
    instance: LimitOrdersContract<WalletUnlocked>,
}

fn pad_zeroes<const A: usize, const B: usize>(arr: [u64; A]) -> [u64; B] {
    assert!(B >= A);
    let mut b = [0; B];
    b[..A].copy_from_slice(&arr);
    b
}

impl OrdersFetcher {
    pub fn new(instance: LimitOrdersContract<WalletUnlocked>) -> OrdersFetcher {
        OrdersFetcher {
            orders: vec![],
            instance,
        }
    }
    pub async fn fetch_all_orders(&mut self) {
        let mut offset = 0;
        let mut orders: Vec<Order> = vec![];
        while offset == 0 || (orders.last().is_some() && orders.last().unwrap().id > 1) {
            let batch: Vec<Order> = get_orders(&self.instance, offset)
                .await
                .to_vec()
                .into_iter()
                .filter(|o| o.is_some())
                .map(|o| o.unwrap())
                .collect();
            orders.extend(batch);
            offset += 10;
        }
        self.orders = orders;
    }
    pub async fn fetch_new_orders(&mut self) {
        let mut offset = 0;
        let mut orders: Vec<Order> = self.orders.clone();
        if orders.first().is_none() {
            return;
        }
        let first_order_id = orders.first().unwrap().id; //can be NONE
        loop {
            let mut batch: Vec<Option<Order>> = get_orders(&self.instance, offset).await.to_vec();
            let mut contains_first_order_id = false;
            batch.clone().into_iter().for_each(|o| {
                if o.is_some() && o.unwrap().id == first_order_id {
                    contains_first_order_id = true;
                }
            });
            batch = batch
                .into_iter()
                .filter(|o| o.is_some() && o.as_ref().unwrap().id > first_order_id)
                .collect();
            let mut batch: Vec<Order> = batch.into_iter().map(|o| o.unwrap()).collect();
            batch.extend(orders.clone());
            orders = batch;
            if contains_first_order_id {
                break;
            }
            offset += 10;
        }
        self.orders = orders;
    }

    pub async fn update_active_orders(&mut self) {
        let mut active_orders: Vec<(u64, u64)> = vec![]; // (index, id)
        let mut i = 0;
        while i < self.orders.len() {
            let order = self.orders[i].clone();
            if order.status == Status::Active {
                active_orders.push((i as u64, order.id));
            }
            i += 1;
        }
        let chanks: Vec<Vec<(u64, u64)>> = active_orders.chunks(10).map(|s| s.into()).collect();
        for chank in chanks {
            let mut arr: [u64; 10] = pad_zeroes([]);
            let mut i = 0;
            while i < chank.len() {
                arr[i] = chank[i].1;
                i += 1;
            }
            let res = orders_by_id(&self.instance, arr).await.to_vec();
            let mut i = 0;
            while i < res.len() {
                if res[i].is_some() {
                    let index = chank[i].0;
                    let array_index = usize::try_from(index).unwrap();
                    let order = res[i].clone().unwrap();
                    self.orders[array_index] = order;
                }
                i += 1;
            }
        }
    }
}
