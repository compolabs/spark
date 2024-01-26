import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import Button from "@components/Button";
import Chip from "@components/Chip";
import { Column, Row } from "@components/Flex";
import { TableText } from "@components/Table";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { useFaucetVM } from "@screens/Faucet/FaucetVm";
import { networks } from "@src/constants";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  display: flex;
  width: 100%;
  flex-direction: column;
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.colors.bgSecondary};
  overflow: hidden;
  border-radius: 10px;
  overflow-x: auto;
  max-width: 100%;

  & > * {
    min-width: 580px;
  }
`;

const StyledTableRow = styled(Row)`
  margin-bottom: 1px;
  height: 48px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.bgPrimary};
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;

  :last-of-type {
    margin-bottom: 0;
  }
`;

const TableTitle = styled(Text)`
  flex: 1;
  white-space: nowrap;
  ${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]}
`;

const TableBody = styled(Column)`
  //overflow: scroll;
  width: 100%;
  box-sizing: border-box;
`;

const TokensFaucetTable: React.FC<IProps> = observer(() => {
  const { accountStore } = useStores();
  const vm = useFaucetVM();
  return (
    <Root>
      <StyledTableRow>
        <TableTitle>Asset</TableTitle>
        <TableTitle>Mint amount</TableTitle>
        <TableTitle>My balance</TableTitle>
        <TableTitle>
          <Row justifyContent="flex-end">{/*<Button style={{ width: 120 }}>Mint all</Button>*/}</Row>
        </TableTitle>
      </StyledTableRow>
      <TableBody>
        {vm.faucetTokens.map((token) => (
          <StyledTableRow key={token.assetId}>
            <TableText type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              {token.name}
            </TableText>
            <TableText type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              {token.mintAmount.toFormat()} &nbsp;<Chip>{token.symbol}</Chip>
            </TableText>
            <TableText type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              {token.formatBalance?.toFormat(2)} &nbsp;<Chip>{token.symbol}</Chip>
            </TableText>
            <Row justifyContent="flex-end" style={{ flex: 1 }}>
              {(() => {
                // if (token.symbol !== "ETH")
                // 	return (
                // 		<Button style={{ width: 120 }} green onClick={() => navigate("/")}>
                // 			Connect wallet
                // 		</Button>
                // 	);
                if (!vm.initialized)
                  return (
                    <Button disabled green>
                      Loading...
                    </Button>
                  );

                return (
                  <Button
                    disabled={
                      vm.loading || !vm.initialized || (token.symbol !== "ETH" && accountStore.address === null)
                    }
                    style={{ width: 120 }}
                    onClick={() => {
                      if (token.symbol === "ETH") {
                        window.open(
                          accountStore.address === null
                            ? networks[0].faucet
                            : `${networks[0].faucet}/?address=${accountStore.address}`,
                          "blank",
                        );
                      } else {
                        vm.mint(token.assetId);
                      }
                    }}
                  >
                    {vm.loading && vm.actionTokenAssetId === token.assetId ? "Loading..." : "Mint"}
                  </Button>
                );
              })()}
            </Row>
          </StyledTableRow>
        ))}
      </TableBody>
    </Root>
  );
});
export default TokensFaucetTable;
