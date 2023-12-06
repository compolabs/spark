/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.69.0
  Forc version: 0.46.1
  Fuel-Core version: 0.20.8
*/

import type {
  BigNumberish,
  BN,
  Bytes,
  BytesLike,
  Contract,
  DecodedValue,
  FunctionFragment,
  Interface,
  InvokeFunction,
  StdString,
} from 'fuels';

import type { Option, Enum } from "./common";

export enum BurnErrorInput { NotEnoughTokens = 'NotEnoughTokens' };
export enum BurnErrorOutput { NotEnoughTokens = 'NotEnoughTokens' };
export type IdentityInput = Enum<{ Address: AddressInput, ContractId: ContractIdInput }>;
export type IdentityOutput = Enum<{ Address: AddressOutput, ContractId: ContractIdOutput }>;

export type AddressInput = { value: string };
export type AddressOutput = AddressInput;
export type AssetIdInput = { value: string };
export type AssetIdOutput = AssetIdInput;
export type ContractIdInput = { value: string };
export type ContractIdOutput = ContractIdInput;
export type RawBytesInput = { ptr: BigNumberish, cap: BigNumberish };
export type RawBytesOutput = { ptr: BN, cap: BN };

interface TokenAbiInterface extends Interface {
  functions: {
    decimals: FunctionFragment;
    name: FunctionFragment;
    symbol: FunctionFragment;
    total_assets: FunctionFragment;
    total_supply: FunctionFragment;
    burn: FunctionFragment;
    mint: FunctionFragment;
  };

  encodeFunctionData(functionFragment: 'decimals', values: [AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'name', values: [AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'symbol', values: [AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'total_assets', values: []): Uint8Array;
  encodeFunctionData(functionFragment: 'total_supply', values: [AssetIdInput]): Uint8Array;
  encodeFunctionData(functionFragment: 'burn', values: [string, BigNumberish]): Uint8Array;
  encodeFunctionData(functionFragment: 'mint', values: [IdentityInput, string, BigNumberish]): Uint8Array;

  decodeFunctionData(functionFragment: 'decimals', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'name', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'symbol', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'total_assets', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'total_supply', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'burn', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'mint', data: BytesLike): DecodedValue;
}

export class TokenAbi extends Contract {
  interface: TokenAbiInterface;
  functions: {
    decimals: InvokeFunction<[asset: AssetIdInput], Option<number>>;
    name: InvokeFunction<[asset: AssetIdInput], Option<StdString>>;
    symbol: InvokeFunction<[asset: AssetIdInput], Option<StdString>>;
    total_assets: InvokeFunction<[], BN>;
    total_supply: InvokeFunction<[asset: AssetIdInput], Option<BN>>;
    burn: InvokeFunction<[sub_id: string, amount: BigNumberish], void>;
    mint: InvokeFunction<[recipient: IdentityInput, sub_id: string, amount: BigNumberish], void>;
  };
}