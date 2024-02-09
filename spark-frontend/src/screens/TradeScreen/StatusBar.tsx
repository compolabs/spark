import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Chip from "@components/Chip";
import { DesktopRow, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 26px;
  box-sizing: border-box;
  //border: 1px solid white;
  padding: 0 16px;
`;

const Indicator = styled.div<{
  error?: boolean;
}>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme, error }) => (error ? theme.colors.redLight : theme.colors.greenLight)};
`;

const Divider = styled.div`
  width: 1px;
  height: 18px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  margin: 0 8px;
`;

const StatusBar: React.FC<IProps> = observer(() => {
  const { accountStore } = useStores();
  return (
    <Root>
      <Row alignItems="center" mainAxisSize="fit-content">
        <Indicator error={!accountStore.signer} />
        <SizedBox width={8} />
        <Text type={TEXT_TYPES.SUPPORTING}>Stable Connection</Text>
      </Row>
      <Divider />
      <Row alignItems="center" mainAxisSize="fit-content">
        <Indicator />
        <SizedBox width={8} />
        <Text type={TEXT_TYPES.SUPPORTING}> Response Time Name holder (xxxms)</Text>
      </Row>
      <DesktopRow>
        <Divider />
        <Text type={TEXT_TYPES.SUPPORTING}>XX,XXX TPS</Text>
        <Divider />
        <Text type={TEXT_TYPES.SUPPORTING}>Average Gas Prices:</Text>
        <SizedBox width={8} />
        <Chip>SPOT:&nbsp;X,XXXX€</Chip>
        <SizedBox width={8} />
        <Chip>PERP:&nbsp;X,XXXX€</Chip>
      </DesktopRow>
    </Root>
  );
});
export default StatusBar;
