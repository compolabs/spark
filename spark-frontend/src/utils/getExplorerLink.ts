import { EXPLORER_URL } from "@src/constants";

export const getExplorerLinkByHash = (hash: string) => {
  return `${EXPLORER_URL}/tx/${hash}`;
};

export const getExplorerLinkByAddress = (address: string) => {
  return `${EXPLORER_URL}/address/${address}`;
};
