import ArbitrumIcon from "../../assets/network/arbitrum.svg";
import FuelIcon from "../../assets/network/fuel.svg";

export enum NETWORK {
  EVM = "EVM",
  FUEL = "FUEL",
}

// TODO: Нужно будет исправить когда будем добавлять другие EVM сети
export const NETWORK_ICON: Record<NETWORK, string> = {
  [NETWORK.EVM]: ArbitrumIcon,
  [NETWORK.FUEL]: FuelIcon,
};

export const AVAILABLE_NETWORKS = [
  {
    title: "ARBITRUM",
    icon: NETWORK_ICON.EVM,
    type: NETWORK.EVM,
  },
  {
    title: "FUEL",
    icon: NETWORK_ICON.FUEL,
    type: NETWORK.FUEL,
  },
];
