import React from "react";
import styled from "@emotion/styled";
import DarkMode from "@components/Header/DarkMode";
import Divider from "./Divider";
import { Anchor } from "@components/Anchor";
import SizedBox from "@components/SizedBox";
import { CONTRACT_ADDRESSES } from "@src/constants";
import { useStores } from "@stores";
import Select from "@components/Select";
import Text from "@components/Text";
import { Row } from "./Flex";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  padding: 0 16px;
  max-width: 1300px;
  white-space: nowrap;
  @media (min-width: 880px) {
  }

  width: 100%;
`;
const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  @media (min-width: 880px) {
    padding: 20px 0;
  }

  a {
    font-size: 13px;
    line-height: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.neutral4};
  }
`;
const versionOptions = Object.keys(CONTRACT_ADDRESSES).map((v) => ({
  title: v,
  key: v,
}));
const Footer: React.FC<IProps> = () => {
  const { settingsStore } = useStores();
  return (
    <Root>
      <Divider />
      <Container>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Anchor href="https://discord.gg/eC97a9U2Pe" type="secondary">
            Need help?
          </Anchor>
        </div>
        <Row
          mainAxisSize="fit-content"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Row
            mainAxisSize="fit-content"
            alignItems="center"
            justifyContent="center"
          >
            <Text fitContent>version</Text>
            <SizedBox width={12} />
            <Select
              options={versionOptions}
              selected={versionOptions.find(
                ({ key }) => key === settingsStore.version
              )}
              onSelect={({ key }) => settingsStore.setVersion(key)}
            />
          </Row>
          <SizedBox width={12} />
          <DarkMode />
        </Row>
      </Container>
    </Root>
  );
};
export default observer(Footer);
