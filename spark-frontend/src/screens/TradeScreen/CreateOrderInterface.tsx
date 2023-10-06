import styled from "@emotion/styled";
import {Column, Row} from "@src/components/Flex";
import React, {useState} from "react";
import SizedBox from "@components/SizedBox";
import {observer} from "mobx-react";
import {useTradeScreenVM} from "@screens/TradeScreen/TradeScreenVm";
import TokenInput from "@components/TokenInput";
import Text from "@components/Text";

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

const CreateOrderInterface: React.FC<IProps> = observer(() => {
    const vm = useTradeScreenVM();

    return <Root>
        <Column crossAxisSize="max">
            <Row>
                <button style={{flex: 1, fontWeight: !vm.isSell ? 'bold' : "normal"}}
                        onClick={() => vm.setIsSell(false)}>Buy
                </button>
                <SizedBox width={8}/>
                <button style={{flex: 1, fontWeight: vm.isSell ? 'bold' : "normal"}}
                        onClick={() => vm.setIsSell(true)}>Sell
                </button>
            </Row>
            <SizedBox height={32}/>
            <h5 style={{margin: "0 0 4px 0"}}>Order type</h5>
            <Row
                alignItems="center"
                style={{background: '#fff', color: '#000', width: '100%', height: 32}}
            >
                <SizedBox width={16}/>
                <Text style={{color: '#000'}}>Spot market</Text>
            </Row>
            <SizedBox height={16}/>
            <h5 style={{margin: "0 0 4px 0"}}>Market price</h5>
            <TokenInput
                decimals={vm.token1.decimals}
                amount={vm.isSell ? vm.sellPrice : vm.buyPrice}
                setAmount={(v) => vm.isSell ? vm.setSellPrice(v, true) : vm.setBuyPrice(v, true)}
                assetId={vm.assetId1}
            />
            <SizedBox height={16}/>
            <h5 style={{margin: "0 0 4px 0"}}>Order size (UNI)</h5>
            <TokenInput
                decimals={vm.token0.decimals}
                amount={vm.isSell ? vm.sellAmount : vm.buyAmount}
                setAmount={(v) => vm.isSell ? vm.setSellAmount(v, true) : vm.setBuyAmount(v, true)}
                assetId={vm.assetId0}
                error={vm.isSell ? vm.sellAmountError : undefined}
            />
            <SizedBox height={16}/>
            <h5 style={{margin: "0 0 4px 0"}}>Order size (USDC)</h5>
            <TokenInput
                decimals={vm.token1.decimals}
                amount={vm.isSell ? vm.sellTotal : vm.buyTotal}
                setAmount={(v) => vm.isSell ? vm.setSellTotal(v, true) : vm.setBuyTotal(v, true)}
                assetId={vm.assetId1}
                error={vm.isSell ? undefined : vm.buyTotalError}
            />
        </Column>

        <button onClick={() => vm.createOrder(vm.isSell ? "sell" : 'buy')}>{vm.isSell ? "Sell" : "Buy"}</button>
    </Root>;
})
export default CreateOrderInterface;
