import React, { useState } from "react";

import Text from "@src/components/Text";
import Tooltip from "@src/components/Tooltip";

import TakeProfitStopLoss from "./TakeProfitStopLoss";

interface Props {
  onVisibleChange: (isVisible: boolean) => void;
  isVisible: boolean;
}

export const TakeProfitStopLossTooltip: React.FC<Props> = ({ onVisibleChange, isVisible }) => {
  const [isTpSlActive, setIsTpSlActive] = useState(false);

  const handleTpSlChange = () => {
    setIsTpSlActive(!isTpSlActive);
  };

  return (
    <Tooltip
      config={{
        placement: "bottom-start",
        trigger: "click",
        visible: isVisible,
        onVisibleChange: onVisibleChange,
      }}
      content={
        <TakeProfitStopLoss
          isTpSlActive={isTpSlActive}
          onClose={() => onVisibleChange(false)}
          onToggleTpSl={handleTpSlChange}
        />
      }
    >
      <Text>TP/SL</Text>
    </Tooltip>
  );
};
