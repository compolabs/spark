import React from "react";
import { observer } from "mobx-react-lite";

import Button from "@components/Button";
import { Row } from "@components/Flex";
import { useStores } from "@stores";

interface IProps {
  assetId: string;
}

const MintButtons: React.FC<IProps> = observer(({ assetId }) => {
  const { faucetStore } = useStores();

  if (!faucetStore.initialized) {
    return (
      <Row justifyContent="flex-end" style={{ flex: 1 }}>
        <Button disabled green>
          Loading...
        </Button>
      </Row>
    );
  }

  return (
    <Row justifyContent="flex-end" style={{ flex: 1 }}>
      <Button
        disabled={faucetStore.disabled(assetId)}
        style={{ width: 120 }}
        onClick={() => faucetStore.mintByAssetId(assetId)}
      >
        {faucetStore.loading && faucetStore.actionTokenAssetId === assetId ? "Loading..." : "Mint"}
      </Button>
    </Row>
  );
});

export default MintButtons;
