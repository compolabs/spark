import styled from "@emotion/styled";
import React from "react";
import Text, {TEXT_TYPES} from "@components/Text";
import {Column, Row} from "@src/components/Flex";

interface IProps {
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  width: 100%;
`;

const UiKit: React.FC<IProps> = () => {
    return <Root>
        <Row mainAxisSize="stretch">
            <Column style={{flex: 1}}>
                <Text type={TEXT_TYPES.H1}>Header 1</Text>
                <Text type={TEXT_TYPES.H2}>Header 2</Text>
                <Text type={TEXT_TYPES.H3}>Header 3</Text>
            </Column>
            <Column style={{flex: 1}}>
                <Text type={TEXT_TYPES.BODY_LARGE}>Body Large text</Text>
                <Text type={TEXT_TYPES.BODY_MEDIUM}>Body Medium text</Text>
                <Text type={TEXT_TYPES.BODY_SMALL}>Body Small text</Text>
            </Column>
            <Column style={{flex: 1}}>
                <Text type={TEXT_TYPES.LABEL}>Body Large text</Text>
                <Text type={TEXT_TYPES.BUTTON}>Body Medium text</Text>
            </Column>
            <Column style={{flex: 1}}>
                <Text type={TEXT_TYPES.NUMBER_LARGE}>Number - Large</Text>
                <Text type={TEXT_TYPES.NUMBER_MEDIUM}>Number - Medium</Text>
                <Text type={TEXT_TYPES.NUMBER_SMALL}>Number - small</Text>
            </Column>
        </Row>
    </Root>;
}
export default UiKit;
