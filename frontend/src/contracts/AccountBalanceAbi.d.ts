/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.69.1
  Forc version: 0.46.1
  Fuel-Core version: 0.20.8
*/

import type {
  BigNumberish,
  BN,
  BytesLike,
  Contract,
  DecodedValue,
  FunctionFragment,
  Interface,
  InvokeFunction,
} from 'fuels';

import type { Option, Enum, Vec } from "./common";

export enum ErrorInput { AccessDenied = 'AccessDenied' }
export enum ErrorOutput { AccessDenied = 'AccessDenied' }

export type AccountBalanceInput = { taker_position_size: I64Input, taker_open_notional: I64Input, last_tw_premium_growth_global: I64Input };
export type AccountBalanceOutput = { taker_position_size: I64Output, taker_open_notional: I64Output, last_tw_premium_growth_global: I64Output };
export type AccountBalanceChangeEventInput = { trader: AddressInput, token: AssetIdInput, account_balance: Option<AccountBalanceInput> };
export type AccountBalanceChangeEventOutput = { trader: AddressOutput, token: AssetIdOutput, account_balance: Option<AccountBalanceOutput> };
export type AccountBalanceChangeEventsBatchInput = { account_balances: [Option<AccountBalanceChangeEventInput>, Option<AccountBalanceChangeEventInput>, Option<AccountBalanceChangeEventInput>, Option<AccountBalanceChangeEventInput>, Option<AccountBalanceChangeEventInput>] };
export type AccountBalanceChangeEventsBatchOutput = { account_balances: [Option<AccountBalanceChangeEventOutput>, Option<AccountBalanceChangeEventOutput>, Option<AccountBalanceChangeEventOutput>, Option<AccountBalanceChangeEventOutput>, Option<AccountBalanceChangeEventOutput>] };
export type AddressInput = { value: string };
export type AddressOutput = AddressInput;
export type AssetIdInput = { value: string };
export type AssetIdOutput = AssetIdInput;
export type I64Input = { value: BigNumberish, negative: boolean };
export type I64Output = { value: BN, negative: boolean };
export type OwedRealizedPnlChangeEventInput = { trader: AddressInput, owed_realized_pnl: I64Input };
export type OwedRealizedPnlChangeEventOutput = { trader: AddressOutput, owed_realized_pnl: I64Output };
export type OwedRealizedPnlChangeEventsBatchInput = { owed_realized_pnls: [Option<OwedRealizedPnlChangeEventInput>, Option<OwedRealizedPnlChangeEventInput>] };
export type OwedRealizedPnlChangeEventsBatchOutput = { owed_realized_pnls: [Option<OwedRealizedPnlChangeEventOutput>, Option<OwedRealizedPnlChangeEventOutput>] };

export type AccountBalanceAbiConfigurables = {
  DUST: BigNumberish;
  PROXY_ADDRESS: AddressInput;
};

interface AccountBalanceAbiInterface extends Interface {
  functions: {
    emit_account_balance_change_event: FunctionFragment;
    emit_owed_realized_pnl_change_event: FunctionFragment;
    get_account_balance: FunctionFragment;
    get_base_tokens: FunctionFragment;
    get_liquidatable_position_size: FunctionFragment;
    get_margin_requirement: FunctionFragment;
    get_margin_requirement_for_liquidation: FunctionFragment;
    get_pnl: FunctionFragment;
    get_taker_open_notional: FunctionFragment;
    get_taker_position_size: FunctionFragment;
    get_total_abs_position_value: FunctionFragment;
    get_total_position_value: FunctionFragment;
    modify_owed_realized_pnl: FunctionFragment;
    register_base_token: FunctionFragment;
    settle_bad_debt: FunctionFragment;
    settle_balance_and_deregister: FunctionFragment;
    settle_owed_realized_pnl: FunctionFragment;
    settle_position_in_closed_market: FunctionFragment;
    update_tw_premium_growth_global: FunctionFragment;
  };

  encodeFunctionData(functionFragment: 'emit_account_balance_change_event', values: [[Option<[AddressInput, AssetIdInput]>, Option<[AddressInput, AssetIdInput]>, Option<[AddressInput, AssetIdInput]>, Option<[AddressInput, AssetIdInput]>, Option<[AddressInput, AssetIdInput]>]]): Uint8Array;
  encodeFunctionData(functionFragment: 'emit_owed_realized_pnl_change_event', values: [[Option<AddressInput>, Option<AddressInput>]]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_account_balance', values: [AddressInput, AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_base_tokens', values: [AddressInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_liquidatable_position_size', values: [AddressInput, AssetIdInput, I64Input]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_margin_requirement', values: [AddressInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_margin_requirement_for_liquidation', values: [AddressInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_pnl', values: [AddressInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_taker_open_notional', values: [AddressInput, AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_taker_position_size', values: [AddressInput, AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_total_abs_position_value', values: [AddressInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'get_total_position_value', values: [AddressInput, AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'modify_owed_realized_pnl', values: [AddressInput, I64Input]): Uint8Array;
  encodeFunctionData(functionFragment: 'register_base_token', values: [AddressInput, AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'settle_bad_debt', values: [AddressInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'settle_balance_and_deregister', values: [AddressInput, AssetIdInput, I64Input, I64Input, I64Input]): Uint8Array;
  encodeFunctionData(functionFragment: 'settle_owed_realized_pnl', values: [AddressInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'settle_position_in_closed_market', values: [AddressInput, AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'update_tw_premium_growth_global', values: [AddressInput, AssetIdInput, I64Input]): Uint8Array;

  decodeFunctionData(functionFragment: 'emit_account_balance_change_event', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'emit_owed_realized_pnl_change_event', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_account_balance', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_base_tokens', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_liquidatable_position_size', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_margin_requirement', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_margin_requirement_for_liquidation', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_pnl', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_taker_open_notional', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_taker_position_size', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_total_abs_position_value', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'get_total_position_value', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'modify_owed_realized_pnl', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'register_base_token', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'settle_bad_debt', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'settle_balance_and_deregister', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'settle_owed_realized_pnl', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'settle_position_in_closed_market', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'update_tw_premium_growth_global', data: BytesLike): DecodedValue;
}

export class AccountBalanceAbi extends Contract {
  interface: AccountBalanceAbiInterface;
  functions: {
    emit_account_balance_change_event: InvokeFunction<[events: [Option<[AddressInput, AssetIdInput]>, Option<[AddressInput, AssetIdInput]>, Option<[AddressInput, AssetIdInput]>, Option<[AddressInput, AssetIdInput]>, Option<[AddressInput, AssetIdInput]>]], void>;
    emit_owed_realized_pnl_change_event: InvokeFunction<[events: [Option<AddressInput>, Option<AddressInput>]], void>;
    get_account_balance: InvokeFunction<[trader: AddressInput, base_token: AssetIdInput], AccountBalanceOutput>;
    get_base_tokens: InvokeFunction<[trader: AddressInput], Vec<AssetIdOutput>>;
    get_liquidatable_position_size: InvokeFunction<[trader: AddressInput, base_token: AssetIdInput, account_value: I64Input], I64Output>;
    get_margin_requirement: InvokeFunction<[trader: AddressInput], BN>;
    get_margin_requirement_for_liquidation: InvokeFunction<[trader: AddressInput], BN>;
    get_pnl: InvokeFunction<[trader: AddressInput], [I64Output, I64Output]>;
    get_taker_open_notional: InvokeFunction<[trader: AddressInput, base_token: AssetIdInput], I64Output>;
    get_taker_position_size: InvokeFunction<[trader: AddressInput, base_token: AssetIdInput], I64Output>;
    get_total_abs_position_value: InvokeFunction<[trader: AddressInput], BN>;
    get_total_position_value: InvokeFunction<[trader: AddressInput, base_token: AssetIdInput], I64Output>;
    modify_owed_realized_pnl: InvokeFunction<[trader: AddressInput, amount: I64Input], void>;
    register_base_token: InvokeFunction<[trader: AddressInput, base_token: AssetIdInput], void>;
    settle_bad_debt: InvokeFunction<[trader: AddressInput], void>;
    settle_balance_and_deregister: InvokeFunction<[trader: AddressInput, base_token: AssetIdInput, taker_base: I64Input, taker_quote: I64Input, realized_pnl: I64Input], void>;
    settle_owed_realized_pnl: InvokeFunction<[trader: AddressInput], I64Output>;
    settle_position_in_closed_market: InvokeFunction<[trader: AddressInput, base_token: AssetIdInput], [I64Output, I64Output, I64Output, BN]>;
    update_tw_premium_growth_global: InvokeFunction<[trader: AddressInput, base_token: AssetIdInput, last_tw_premium_growth_global: I64Input], void>;
  };
}
