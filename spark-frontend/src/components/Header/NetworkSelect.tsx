import React, { useState } from "react";
import { observer } from "mobx-react";

import Tooltip from "@components/Tooltip";
import { NETWORK } from "@src/blockchain/types";
import { useStores } from "@src/stores";

import NetworkSelectButton from "./NetworkSelectButton";
import NetworkSelectContent from "./NetworkSelectContent";

interface Props {
  isSmall?: boolean;
}

const NetworkSelect: React.FC<Props> = observer(({ isSmall }) => {
  const { blockchainStore } = useStores();

  const [isFocused, setIsFocused] = useState(false);

  const handleNetworkSelect = (type: NETWORK) => {
    blockchainStore.connectTo(type);
  };

  const renderTooltip = () => {
    return (
      <Tooltip
        config={{
          placement: "bottom-start",
          trigger: "click",
          onVisibleChange: setIsFocused,
        }}
        content={<NetworkSelectContent onNetworkClick={handleNetworkSelect} />}
      >
        <NetworkSelectButton isFocused={isFocused} isSmall={isSmall} />
      </Tooltip>
    );
  };

  return renderTooltip();
});

export default NetworkSelect;
