import React, { useState } from "react";

import Button from "@src/components/Button";
import { Checkbox } from "@src/components/Checkbox";
import Sheet from "@src/components/Sheet";
import { SmartFlex } from "@src/components/SmartFlex";
import Text, { TEXT_TYPES } from "@src/components/Text";
import TokenInput from "@src/components/TokenInput";
import BN from "@src/utils/BN";

interface Props {
  isOpen: boolean;
  isTpSlActive: boolean;
  onToggleTpSl: () => void;
  onClose: () => void;
}

const TakeProfitStopLossSheet: React.FC<Props> = ({ isOpen, isTpSlActive, onToggleTpSl, onClose }) => {
  const [amount, setAmount] = useState(BN.ZERO);

  const handleApply = () => {
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <SmartFlex alignItems="flex-start" gap="8px" padding="0 16px 16px" column>
        <Checkbox checked={isTpSlActive} onChange={onToggleTpSl}>
          <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
            TP / SL
          </Text>
        </Checkbox>
        <SmartFlex gap="8px" width="100%" column>
          <TokenInput amount={amount} assetId="" decimals={2} label="Take profit" />
          <TokenInput amount={amount} assetId="" decimals={2} label="Stop loss" />
          <Button onClick={handleApply}>APPLY</Button>
        </SmartFlex>
      </SmartFlex>
    </Sheet>
  );
};

export default TakeProfitStopLossSheet;
