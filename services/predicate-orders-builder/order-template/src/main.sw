predicate;
mod utils;
use utils::*;

use std::{
    b512::B512,
    constants::ZERO_B256,
    contract_id::ContractId,
    context::this_balance,
    ecr::ec_recover_address,
    inputs::{
        input_count,
        input_owner,
        input_predicate_data,
    },
    outputs::{
        Output,
        output_amount,
        output_type,
    },
    revert::require,
};

pub struct LimitOrder {
    asset0: b256,
    amount0: u64,
    asset1: b256,
    amount1: u64,
    owner: b256,
    id: str[30], //u64,
}

// const SPENDING_SCRIPT_HASH = 0x7895d0059c0d0c1de8de15795191a1c1d01cd970db75fa42e15dc96e051b5570; //FIXME

// ПЛАН А
// получаем balance предиката
// считаем цену price = order.amount0 / order.amount1
// если input_owner == order.owner то возаращаем ему balance
// проверяем tx_script_bytecode_hash
// // INPUTS //
// получаем количество и асет текущего инпута 
// amount0 = input_coin_amount
// amount1 = input_coin_amount / price
// input_coin_asset_id == ORDER.asset0 && input_coin_amount <= balance * price
// // OUTPUTS //
// verify_output_coin
// output_coin_asset_id == ORDER.asset1; 
// output_amount == amount1; 
// output_coin_to == ORDER.owner

// ПЛАН Б
// создаем предикат
// частично заполняем и передаем адрес нового предиката аргументом
// дозаполняем новый предикат

// - сделать создание дополнительного предиката на клиенте
// - разобраться как передавать аргумент в предикат
// - добавить в предикат проверки на второй аутпут
// - добавить в запуск аутпутов 
// - протестировать
// - написать заполнение полностью нового предиката

const ORDER = LimitOrder {
    //------------------------------
    asset0: 0x4e68158aa0dd81c438160a6ef38829363cf96eeef1ae5c6cb3cccb1c52a7e685,
    amount0: 1000000000,
    asset1: 0x35395f5b21b3e93e0dd4e476bc8d92a989185cf050a71aff861667d5a1ddefe3,
    amount1: 200000000000,
    owner: 0x5d99ee966b42cd8fc7bdd1364b389153a9e78b42b7d4a691470674e817888d4e,
    id: "------------------------------",
    //------------------------------
    // asset0: <ASSET0>,
    // amount0: <AMOUNT0>,
    // asset1: <ASSET1>,
    // amount1:<AMOUNT1>,
    // owner: <OWNER>,
    // id: <ORDER_ID>,
    //------------------------------
};
const OUTPUT_COIN_INDEX = 0u8;
fn main(/* new_predicate_id: Option<ContractId> */) -> bool {
    //take_coin: b256, min_take_amount: u64, maker: b256
    // CANCELLATION //
    let owner = Address::from(ORDER.owner);
    if input_count() == 2u8 {
        if input_owner(0).unwrap() == owner
            || input_owner(1).unwrap() == owner
        {
            return true;
        };
    };
 
   // INPUTS //
    // assert(tx_script_bytecode_hash() == SPENDING_SCRIPT_HASH); //FIXME
    assert(input_coin_asset_id(0) == ORDER.asset0);
    // assert(input_coin_amount(0) == ORDER.amount0);//>= //FIXME
    /*todo: The gas coin stuff, note: that if this is the same coin as the take
     coin then we will need to verify slightly differently
     let gas_coin = input_coin_asset_id(1);
     let gas_coin_amount = input_coin_amount(1);
     assert(gas_coin_amount >= tx_gas_price() * MIN_GAS);
     assert(tx_gas_limit() >= MIN_GAS);*/

    // OUTPUTS //
    // this is the one that is failing, its because maker above is set to 0, which is incorrect
    // just need to pass this thing in args (along with all other params)
    assert(output_coin_to(OUTPUT_COIN_INDEX) == ORDER.owner); //maker
    // assert(output_count() == 2); //FIXME
    match output_type(OUTPUT_COIN_INDEX) { // assert(verify_output_coin(OUTPUT_COIN_INDEX));
        Output::Coin => (),
        _ => revert(0),
    };
    assert(output_coin_asset_id(OUTPUT_COIN_INDEX) == ORDER.asset1);
    // assert(output_amount(OUTPUT_COIN_INDEX) == ORDER.amount1);//>= //FIXME

    true
    // let amount = output_amount(OUTPUT_COIN_INDEX);
    // if amount >= ORDER.amount1 { 
    //     true
    // } else if amount < ORDER.amount1 && new_predicate_id.is_some()  { 
    //     // TODO check outputs and another stuff
    //     //      make transfer
    //     true
    // } else { 
    //     false
    // }
}
