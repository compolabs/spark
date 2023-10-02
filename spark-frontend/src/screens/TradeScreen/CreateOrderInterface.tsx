import styled from "@emotion/styled";
import {Column, Row} from "@src/components/Flex";
import React from "react";
import SizedBox from "@components/SizedBox";

interface IProps {
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid white;
  border-top: 0;
  border-bottom: 0;
  box-sizing: border-box;
  padding: 16px;
  flex: 1;
  height: 100%;
`;

const CreateOrderInterface: React.FC<IProps> = () => {
    return <Root>
        <Column crossAxisSize="max">
            <Row>
                <button style={{flex: 1}}>Buy</button>
                <SizedBox width={8}/>
                <button style={{flex: 1}}>Sell</button>
            </Row>
            <SizedBox height={32}/>
            <h5 style={{margin: "0 0 4px 0"}}>Order type</h5>
            <input value="Spot market" disabled/>
            <SizedBox height={16}/>
            <h5 style={{margin: "0 0 4px 0"}}>Market price</h5>
            <input value={0}/>
            <SizedBox height={16}/>
            <h5 style={{margin: "0 0 4px 0"}}>Order size (BTC)</h5>
            <input value={0}/>
            <SizedBox height={16}/>
            <h5 style={{margin: "0 0 4px 0"}}>Order size (USDC)</h5>
            <input value={0}/>
        </Column>
        <button>Buy</button>
    </Root>;
}
export default CreateOrderInterface;
