import styled from "@emotion/styled";
import React, { useState } from "react";
import SizedBox from "@components/SizedBox";
import TokenInput from "@components/TokenInput/TokenInput";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import { Column, Row } from "@src/components/Flex";
import Text, { TEXT_TYPES } from "@src/components/Text";
import Button, { ButtonGroup } from "@src/components/Button";
import Select from "@src/components/Select";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  width: 100%;
  background: #353532;
`;

const UiKit: React.FC<IProps> = () => {
  const categoriesOptions = [
    { title: "All categories", key: "all" },
    { title: "Stablecoins", key: "stable" },
    { title: "Waves DeFi", key: "defi" },
    { title: "Waves Ducks", key: "duck" }
  ];
  const [value, setValue] = useState<any>();

  const [amount, setAmount] = useState(BN.ZERO);
  return (
    <Root>
      <Row mainAxisSize="fit-content">
        <Column style={{ flex: 1 }}>
          <Text type={TEXT_TYPES.H1}>Header 1</Text>
          <Text type={TEXT_TYPES.H2}>Header 2</Text>
          <Text type={TEXT_TYPES.H3}>Header 3</Text>
        </Column>
        <SizedBox width={16} />
        <Column style={{ flex: 1 }}>
          <Text type={TEXT_TYPES.BODY_LARGE}>Body Large text</Text>
          <Text type={TEXT_TYPES.BODY_MEDIUM}>Body Medium text</Text>
          <Text type={TEXT_TYPES.BODY_SMALL}>Body Small text</Text>
        </Column>
        <SizedBox width={16} />
        <Column style={{ flex: 1 }}>
          <Text type={TEXT_TYPES.LABEL}>Body Large text</Text>
          <Text type={TEXT_TYPES.BUTTON}>Body Medium text</Text>
        </Column>
        <SizedBox width={16} />
        <Column style={{ flex: 1 }}>
          <Text type={TEXT_TYPES.NUMBER_LARGE}>Number - Large</Text>
          <Text type={TEXT_TYPES.NUMBER_MEDIUM}>Number - Medium</Text>
          <Text type={TEXT_TYPES.NUMBER_SMALL}>Number - small</Text>
        </Column>
      </Row>
      <SizedBox height={32} />
      <Row mainAxisSize="fit-content">
        <Column style={{ flex: 1 }}>
          <Button primary>Primary filled button</Button>
          <SizedBox height={16} />
          <Button secondary>Secondary filled button</Button>
          <SizedBox height={16} />
          <Button>Neutral filled button</Button>
          <SizedBox height={16} />
          <Button outline>Outline button</Button>
        </Column>
        <SizedBox width={16} />
        <Column style={{ flex: 1 }}>
          <Button primary disabled>
            Primary filled button
          </Button>
          <SizedBox height={16} />
          <Button secondary disabled>
            Secondary filled button
          </Button>
          <SizedBox height={16} />
          <Button disabled>Neutral filled button</Button>
          <SizedBox height={16} />
          <Button outline disabled>
            Outline button
          </Button>
        </Column>
      </Row>
      <SizedBox height={32} />
      <ButtonGroup>
        <Button primary>Option 1</Button>
        <Button secondary>Option 2</Button>
        <Button>Option 3</Button>
        <Button outline>Option 4</Button>
      </ButtonGroup>
      <SizedBox height={16} />
      <ButtonGroup>
        <Button primary>Option 1</Button>
        <Button outline>Option 2</Button>
      </ButtonGroup>
      <SizedBox height={16} />
      <ButtonGroup>
        <Button outline>Option 1</Button>
        <Button secondary>Option 2</Button>
      </ButtonGroup>
      <SizedBox height={16} />
      <ButtonGroup>
        <Button>Option 1</Button>
        <Button outline>Option 2</Button>
      </ButtonGroup>
      <SizedBox height={16} />
      <ButtonGroup>
        <Button outline>Option 1</Button>
        <Button>Option 2</Button>
      </ButtonGroup>
      <SizedBox height={16} />
      <Select
        label="label"
        options={categoriesOptions}
        selected={value}
        onSelect={(v) => setValue(v)}
      />
      <SizedBox height={16} />
      <TokenInput
        assetId={TOKENS_BY_SYMBOL.ETH.assetId}
        decimals={TOKENS_BY_SYMBOL.ETH.decimals}
        amount={amount}
        setAmount={setAmount}
        label="LABEL"
        errorMessage="This is an error message"
        error={true}
        // disabled
      />
    </Root>
  );
};
export default UiKit;
