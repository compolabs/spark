import React from "react";
import { observer } from "mobx-react-lite";

import Button from "@components/Button";
import { Row } from "@components/Flex";
import { ARBITRUM_SEPOLIA_FAUCET, TOKENS_BY_ASSET_ID } from "@src/constants";
import { useStores } from "@stores";

interface IProps {
  assetId: string;
}

const MintButtons: React.FC<IProps> = observer(({ assetId }) => {
  const { accountStore, faucetStore } = useStores();
  const token = TOKENS_BY_ASSET_ID[assetId];
  return (
    <>
      <Row justifyContent="flex-end" style={{ flex: 1 }}>
        {!faucetStore.initialized ? (
          <Button disabled green>
            Loading...
          </Button>
        ) : (
          <Button
            disabled={
              faucetStore.loading ||
              !faucetStore.initialized ||
              (token && token.symbol !== "ETH" && accountStore.address === null)
            }
            style={{ width: 120 }}
            onClick={() => {
              if (token && token.symbol === "ETH") {
                window.open(
                  accountStore.address === null
                    ? ARBITRUM_SEPOLIA_FAUCET
                    : `${ARBITRUM_SEPOLIA_FAUCET}/?address=${accountStore.address}`,
                  "blank",
                );
              } else if (token) {
                faucetStore.mint(assetId);
              }
            }}
          >
            {faucetStore.loading && faucetStore.actionTokenAssetId === assetId ? "Loading..." : "Mint"}{" "}
          </Button>
        )}
      </Row>
    </>
  );
});

export default MintButtons;
