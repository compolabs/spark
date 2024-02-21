import React, { useState } from "react";
import styled from "@emotion/styled";

import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import limitBuyChart from "@src/assets/tooltip/order/limitBuyChart.png";
import limitSellChart from "@src/assets/tooltip/order/limitSellChart.png";
import marketChart from "@src/assets/tooltip/order/marketChart.png";
import stopMarketChart from "@src/assets/tooltip/order/stopMarketChart.png";
import { RadioButton } from "@src/components/RadioButton";
import Sheet from "@src/components/Sheet";
import { SmartFlex } from "@src/components/SmartFlex";
import Tab from "@src/components/Tab";
import Text, { TEXT_TYPES } from "@src/components/Text";
import Tooltip from "@src/components/Tooltip";

enum CHART_INFO {
  Market,
  StopMarket,
  LimitBuy,
  LimitSell,
}
const TABS = [
  { title: "MARKET", key: [CHART_INFO.Market] },
  { title: "LIMIT", key: [CHART_INFO.LimitBuy, CHART_INFO.LimitSell] },
  { title: "STOP-MARKET", key: [CHART_INFO.StopMarket] },
];

const CHART_IMG_MAP = {
  [CHART_INFO.LimitBuy]: limitBuyChart,
  [CHART_INFO.LimitSell]: limitSellChart,
  [CHART_INFO.Market]: marketChart,
  [CHART_INFO.StopMarket]: stopMarketChart,
};

const CHART_DESCRIPTION_MAP = {
  [CHART_INFO.LimitBuy]:
    "A limit order is a type of stock order where you specify the maximum price you're willing to buy or sell a stock. If the market price reaches your specified limit price, the order is executed. If not, the order remains open until your conditions are met.",
  [CHART_INFO.LimitSell]:
    "A limit order is a type of stock order where you specify the maximum price you're willing to buy or sell a stock. If the market price reaches your specified limit price, the order is executed. If not, the order remains open until your conditions are met.",
  [CHART_INFO.Market]:
    "A market order is a stock order that is executed immediately at the current market price. When you place a market order, you are prioritizing the execution speed over the specific price, so the final price at which the trade occurs may vary slightly from the current quoted price.",
  [CHART_INFO.StopMarket]:
    'A stop-limit order combines features of both stop and limit orders. You set a "stop" price to trigger the order, and then a "limit" price that specifies the highest or lowest price at which you\'re willing to buy or sell. When the stop price is reached, the order becomes a limit order and will be executed only at the specified limit price or better',
};

const LIMIT_PAGES = new Set([CHART_INFO.LimitBuy, CHART_INFO.LimitSell]);

const OrderType: React.FC = () => {
  const [chartInfoIndex, setChartInfoIndex] = useState(CHART_INFO.Market);

  const handleSetTabIndex = (keys: CHART_INFO[]) => {
    setChartInfoIndex(keys[0]);
  };

  const renderTabs = () => {
    return (
      <TabContainer center="y">
        {TABS.map((tab) => (
          <Tab key={tab.title} active={tab.key.includes(chartInfoIndex)} onClick={() => handleSetTabIndex(tab.key)}>
            {tab.title}
          </Tab>
        ))}
      </TabContainer>
    );
  };

  const renderContent = () => {
    const text = CHART_DESCRIPTION_MAP[chartInfoIndex];
    const img = CHART_IMG_MAP[chartInfoIndex];

    return (
      <SmartFlex width="360px" center column>
        {renderRadioButtons()}
        <StyledImg src={img} />
        <Desc type={TEXT_TYPES.BODY}>{text}</Desc>
      </SmartFlex>
    );
  };

  const handleRadioClick = (value: string) => {
    setChartInfoIndex(value === "buy" ? CHART_INFO.LimitBuy : CHART_INFO.LimitSell);
  };

  const renderRadioButtons = () => {
    const isLimit = LIMIT_PAGES.has(chartInfoIndex);

    return (
      <RadioContainer alignSelf="flex-end" isVisible={isLimit}>
        <RadioButton
          isSelected={chartInfoIndex === CHART_INFO.LimitBuy}
          label="BUY"
          value="buy"
          onChange={handleRadioClick}
        />
        <RadioButton
          isSelected={chartInfoIndex === CHART_INFO.LimitSell}
          label="SELL"
          value="sell"
          onChange={handleRadioClick}
        />
      </RadioContainer>
    );
  };

  return (
    <SmartFlex center column>
      {renderTabs()}
      {renderContent()}
    </SmartFlex>
  );
};

export const OrderTypeTooltipIcon: React.FC<{ text: string; onClick?: () => void }> = ({ text, onClick }) => {
  return (
    <SmartFlex center="y" gap="2px" onClick={onClick}>
      <InfoIcon />
      <Text type={TEXT_TYPES.SUPPORTING}>{text}</Text>
    </SmartFlex>
  );
};

export const OrderTypeTooltip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Tooltip
      config={{
        placement: "bottom-start",
        trigger: "click",
        visible: isVisible,
        onVisibleChange: setIsVisible,
      }}
      content={<OrderType />}
    >
      <OrderTypeTooltipIcon text="About order type" />
    </Tooltip>
  );
};

export const OrderTypeSheet: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <SmartFlex margin="0 0 32px" center>
        <OrderType />
      </SmartFlex>
    </Sheet>
  );
};

const TabContainer = styled(SmartFlex)`
  align-self: flex-start;
  gap: 28px;
  padding: 0 16px 8px;
`;

const StyledImg = styled.img`
  width: 360px;
  height: 200px;
`;

const Desc = styled(Text)`
  padding: 8px 16px;
  height: 120px;
`;

const RadioContainer = styled(SmartFlex)<{ isVisible?: boolean }>`
  visibility: ${({ isVisible }) => (isVisible ? "auto" : "hidden")};
  gap: 18px;
  margin: 0 52px;
`;
