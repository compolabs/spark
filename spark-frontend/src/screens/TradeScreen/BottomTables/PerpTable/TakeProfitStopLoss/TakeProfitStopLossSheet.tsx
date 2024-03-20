import React from "react";

import Sheet from "@src/components/Sheet";

import TakeProfitStopLoss from "./TakeProfitStopLoss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isTpSlActive: boolean;
  onToggleTpSl: () => void;
}

const TakeProfitStopLossSheet: React.FC<Props> = ({ isOpen, onClose, isTpSlActive, onToggleTpSl }) => {
  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <TakeProfitStopLoss isTpSlActive={isTpSlActive} onClose={onClose} onToggleTpSl={onToggleTpSl} />
    </Sheet>
  );
};

export default TakeProfitStopLossSheet;
