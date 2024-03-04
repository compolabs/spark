import { EXPLORER_URL as EVM_EXPLORER_URL } from "@src/blockchain/evm/constants";
import { EXPLORER_URL as FUEL_EXPLORER_URL } from "@src/blockchain/fuel/constants";
import { NETWORK } from "@src/blockchain/types";

const getExplorerUrlByNetwork = (network: NETWORK) => {
  if (network === NETWORK.EVM) return EVM_EXPLORER_URL;
  else if (network === NETWORK.FUEL) return FUEL_EXPLORER_URL;

  throw new Error("Unsupported network");
};

export const getExplorerLinkByHash = (hash: string, network: NETWORK) => {
  return `${getExplorerUrlByNetwork(network)}/tx/${hash}`;
};

export const getExplorerLinkByAddress = (address: string, network: NETWORK) => {
  return `${getExplorerUrlByNetwork(network)}/address/${address}`;
};
