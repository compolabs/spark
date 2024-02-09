import React from "react";
import { observer } from "mobx-react-lite";

import Button from "@components/Button";
import { Row } from "@components/Flex";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { useStores } from "@stores";

interface IProps {
  assetId: string;
}

const MintButtons: React.FC<IProps> = observer(({ assetId }) => {
  const { accountStore, faucetStore } = useStores();
  const token = TOKENS_BY_ASSET_ID[assetId];
  if (!faucetStore.initialized) {
    return (
      <Row justifyContent="flex-end" style={{ flex: 1 }}>
        <Button disabled green>
          Loading...
        </Button>
      </Row>
    );
  }
  const handleClick = () => {
    faucetStore.handleClick(assetId);
  };
  return (
    <Row justifyContent="flex-end" style={{ flex: 1 }}>
      <Button disabled={faucetStore.disabled(assetId)} style={{ width: 120 }} onClick={handleClick}>
        {faucetStore.loading && faucetStore.actionTokenAssetId === assetId ? "Loading..." : "Mint"}
      </Button>
    </Row>
  );
});

export default MintButtons;
