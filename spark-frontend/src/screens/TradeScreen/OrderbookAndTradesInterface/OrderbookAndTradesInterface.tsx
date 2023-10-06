import styled from "@emotion/styled";
import React, {useState} from "react";
import DesktopOrderBook from "@screens/TradeScreen/OrderbookAndTradesInterface/DesktopOrderBook";
import {Row} from "@components/Flex";
import SizedBox from "@components/SizedBox";

interface IProps {
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid white;
  border-top: 0;
  border-bottom: 0;
  box-sizing: border-box;
  padding: 16px;
  flex: 1;
  height: 100%;
`;

const OrderbookAndTradesInterface: React.FC<IProps> = () => {
    const [isOrderbook, setIsOrderbook] = useState(true);
    return <Root>
        <Row>
            <button style={{flex: 1, fontWeight: isOrderbook ? 'bold' : "normal"}}
                    onClick={() => setIsOrderbook(true)}>Orderbook
            </button>
            <SizedBox width={8}/>
            <button style={{flex: 1, fontWeight: !isOrderbook ? 'bold' : "normal"}}
                    onClick={() => setIsOrderbook(false)}>Trades
            </button>
        </Row>
        <SizedBox height={16}/>
        {isOrderbook ? <DesktopOrderBook/> : null}
    </Root>;
}
export default OrderbookAndTradesInterface;


