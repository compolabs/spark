import styled from "@emotion/styled";
import React, {useState} from "react";
import SizedBox from "@components/SizedBox";
import TokenInput from "@components/TokenInput/TokenInput";
import {TOKENS_BY_SYMBOL} from "@src/constants";
import BN from "@src/utils/BN";

interface IProps {
}

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
    // const [options] = React.useState([
    //   { id: 1, value: "Option1" },
    //   { id: 2, value: "Option2" },
    //   { id: 3, value: "Option3" },
    //   { id: 4, value: "Option4" },
    //   { id: 5, value: "Option5" },
    //   { id: 7, value: "Option6" },
    //   { id: 8, value: "Option6" },
    //   { id: 9, value: "Option6" }
    // ]);
    // const selectedOption = (option: any) => console.log(option);

    const [amount, setAmount] = useState(BN.ZERO);
    return (
        <Root>
            {/*<Row mainAxisSize="fit-content">*/}
            {/*    <Column style={{flex: 1}}>*/}
            {/*        <Text type={TEXT_TYPES.H1}>Header 1</Text>*/}
            {/*        <Text type={TEXT_TYPES.H2}>Header 2</Text>*/}
            {/*        <Text type={TEXT_TYPES.H3}>Header 3</Text>*/}
            {/*    </Column>*/}
            {/*    <SizedBox width={16}/>*/}
            {/*    <Column style={{flex: 1}}>*/}
            {/*        <Text type={TEXT_TYPES.BODY_LARGE}>Body Large text</Text>*/}
            {/*        <Text type={TEXT_TYPES.BODY_MEDIUM}>Body Medium text</Text>*/}
            {/*        <Text type={TEXT_TYPES.BODY_SMALL}>Body Small text</Text>*/}
            {/*    </Column>*/}
            {/*    <SizedBox width={16}/>*/}
            {/*    <Column style={{flex: 1}}>*/}
            {/*        <Text type={TEXT_TYPES.LABEL}>Body Large text</Text>*/}
            {/*        <Text type={TEXT_TYPES.BUTTON}>Body Medium text</Text>*/}
            {/*    </Column>*/}
            {/*    <SizedBox width={16}/>*/}
            {/*    <Column style={{flex: 1}}>*/}
            {/*        <Text type={TEXT_TYPES.NUMBER_LARGE}>Number - Large</Text>*/}
            {/*        <Text type={TEXT_TYPES.NUMBER_MEDIUM}>Number - Medium</Text>*/}
            {/*        <Text type={TEXT_TYPES.NUMBER_SMALL}>Number - small</Text>*/}
            {/*    </Column>*/}
            {/*</Row>*/}
            {/*<SizedBox height={32}/>*/}
            {/*<Row mainAxisSize="fit-content">*/}
            {/*    <Column style={{flex: 1}}>*/}
            {/*        <Button primary>Primary filled button</Button>*/}
            {/*        <SizedBox height={16}/>*/}
            {/*        <Button secondary>Secondary filled button</Button>*/}
            {/*        <SizedBox height={16}/>*/}
            {/*        <Button>Neutral filled button</Button>*/}
            {/*        <SizedBox height={16}/>*/}
            {/*        <Button outline>Outline button</Button>*/}
            {/*    </Column>*/}
            {/*    <SizedBox width={16}/>*/}
            {/*    <Column style={{flex: 1}}>*/}
            {/*        <Button primary disabled>*/}
            {/*            Primary filled button*/}
            {/*        </Button>*/}
            {/*        <SizedBox height={16}/>*/}
            {/*        <Button secondary disabled>*/}
            {/*            Secondary filled button*/}
            {/*        </Button>*/}
            {/*        <SizedBox height={16}/>*/}
            {/*        <Button disabled>Neutral filled button</Button>*/}
            {/*        <SizedBox height={16}/>*/}
            {/*        <Button outline disabled>*/}
            {/*            Outline button*/}
            {/*        </Button>*/}
            {/*    </Column>*/}
            {/*</Row>*/}
            {/*<SizedBox height={32}/>*/}
            {/*<ButtonGroup>*/}
            {/*    <Button primary>Option 1</Button>*/}
            {/*    <Button secondary>Option 2</Button>*/}
            {/*    <Button>Option 3</Button>*/}
            {/*    <Button outline>Option 4</Button>*/}
            {/*</ButtonGroup>*/}
            {/*<SizedBox height={16}/>*/}
            {/*<ButtonGroup>*/}
            {/*    <Button primary>Option 1</Button>*/}
            {/*    <Button outline>Option 2</Button>*/}
            {/*</ButtonGroup>*/}
            {/*<SizedBox height={16}/>*/}
            {/*<ButtonGroup>*/}
            {/*    <Button outline>Option 1</Button>*/}
            {/*    <Button secondary>Option 2</Button>*/}
            {/*</ButtonGroup>*/}
            {/*<SizedBox height={16}/>*/}
            {/*<ButtonGroup>*/}
            {/*    <Button>Option 1</Button>*/}
            {/*    <Button outline>Option 2</Button>*/}
            {/*</ButtonGroup>*/}
            {/*<SizedBox height={16}/>*/}
            {/*<ButtonGroup>*/}
            {/*    <Button outline>Option 1</Button>*/}
            {/*    <Button>Option 2</Button>*/}
            {/*</ButtonGroup>*/}
            {/*<SizedBox height={16} />*/}
            {/*<Select*/}
            {/*  options={options}*/}
            {/*  setSelectedOption={selectedOption}*/}
            {/*  placeholder="Dropdown"*/}
            {/*  label="Label"*/}
            {/*/>*/}
            <SizedBox height={16}/>
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
