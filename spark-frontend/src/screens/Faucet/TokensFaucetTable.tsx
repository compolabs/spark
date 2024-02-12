import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import Chip from "@components/Chip";
import { Column, Row } from "@components/Flex";
import { TableText } from "@components/Table";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { useStores } from "@stores";

import MintButtons from "./MintButtons";

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

const TokensFaucetTable: React.FC<IProps> = observer((assetId) => {
  const { accountStore, faucetStore } = useStores();
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
        {faucetStore.faucetTokens.map((token) => (
          <StyledTableRow key={token.assetId}>
            <TableText type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              {token.name}
            </TableText>
            <TableText type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              {token.mintAmount.toSignificant(3)} &nbsp;<Chip>{token.symbol}</Chip>
            </TableText>
            <TableText type={TEXT_TYPES.BUTTON_SECONDARY} primary>
              {token.formatBalance?.toSignificant(3)} &nbsp;<Chip>{token.symbol}</Chip>
            </TableText>
            <MintButtons assetId={token.assetId} />
          </StyledTableRow>
        ))}
      </TableBody>
    </Root>
  );
});
export default TokensFaucetTable;
