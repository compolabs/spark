import React from "react";

import { NETWORK } from "@src/blockchain/types";
import { useStores } from "@src/stores";

import NetworkSelectContent from "../Header/NetworkSelectContent";
import Sheet from "../Sheet";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NetworkSelectSheet: React.FC<Props> = ({ isOpen, onClose }) => {
  const { blockchainStore } = useStores();

  const handleNetworkSelect = (type: NETWORK) => {
    blockchainStore.connectTo(type);
  };

  return (
    <Sheet detent="full-height" isOpen={isOpen} snapPoints={[300]} onClose={onClose}>
      <NetworkSelectContent onNetworkClick={handleNetworkSelect} />
    </Sheet>
  );
};

export default NetworkSelectSheet;
