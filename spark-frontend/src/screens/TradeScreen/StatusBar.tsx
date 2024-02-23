import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Row } from "@components/Flex";
import Text, { TEXT_TYPES } from "@components/Text";
import { useStores } from "@stores";

interface IProps {}

const Root = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 26px;
  box-sizing: border-box;
  justify-content: space-between;
  //border: 1px solid white;
  //padding: 0 16px;
  flex-shrink: 0;
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

const LinkText = styled(Text)`
  ${TEXT_TYPES.SUPPORTING};
  transition: .4s;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
;
}
`;

const StatusBar: React.FC<IProps> = observer(() => {
  const { accountStore } = useStores();
  return (
    <Root>
      <Row alignItems="center" mainAxisSize="fit-content" />
      <Row alignItems="center" mainAxisSize="fit-content">
        <a href="https://twitter.com/Sprkfi" rel="noreferrer noopener" target="_blank">
          <LinkText type={TEXT_TYPES.SUPPORTING}>✨Wanna sparkle?</LinkText>
        </a>
      </Row>
      <Row alignItems="center" mainAxisSize="fit-content">
        <Text type={TEXT_TYPES.SUPPORTING}>Network: {accountStore.network.name}</Text>
      </Row>

      {/*
      <Row alignItems="center" mainAxisSize="fit-content">
        <Indicator error={!accountStore.signer} />
        <SizedBox width={8} />
        <Text type={TEXT_TYPES.SUPPORTING}>Stable Connection</Text>
      </Row>
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
      */}
    </Root>
  );
});
export default StatusBar;
