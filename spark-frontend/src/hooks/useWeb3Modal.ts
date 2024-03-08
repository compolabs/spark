import { useEffect } from "react";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";

import { useStores } from "@src/stores";

export const useWeb3Modal = () => {
  const { blockchainStore } = useStores();
  const { isConnected } = useWeb3ModalAccount();

  useEffect(() => {
    if (isConnected) {
      blockchainStore.currentInstance?.connectWallet();
    }
  }, [isConnected]);
};
