import styled from "@emotion/styled";
import React, { useState } from "react";
import DesktopOrderBook from "@screens/TradeScreen/OrderbookAndTradesInterface/DesktopOrderBook";
import SizedBox from "@components/SizedBox";
import Button, { ButtonGroup } from "@components/Button";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid white;
  box-sizing: border-box;
  padding: 16px;
  flex: 2;
  height: 100%;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.gray4};
`;

const OrderbookAndTradesInterface: React.FC<IProps> = () => {
  const [isOrderbook, setIsOrderbook] = useState(true);
  return (
    <Root>
      <ButtonGroup>
        <Button outline={!isOrderbook} onClick={() => setIsOrderbook(true)}>
          Orderbook
        </Button>
        <Button outline={isOrderbook} onClick={() => setIsOrderbook(false)}>
          Trades
        </Button>
      </ButtonGroup>
      <SizedBox height={16} />
      {isOrderbook ? <DesktopOrderBook /> : null}
    </Root>
  );
};
export default OrderbookAndTradesInterface;
