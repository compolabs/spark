import React, { useState } from "react";
import { Config } from "react-popper-tooltip";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import tableSizeSelector from "@src/assets/icons/tablesSize.svg";
import { Row } from "@src/components/Flex";
import SizedBox from "@src/components/SizedBox";
import { SmartFlex } from "@src/components/SmartFlex";
import Tab from "@src/components/Tab";
import Text, { TEXT_TYPES } from "@src/components/Text";
import Tooltip from "@src/components/Tooltip";
import { useStores } from "@src/stores";
import { TRADE_TABLE_SIZE } from "@src/stores/SettingsStore";
import { media } from "@src/themes/breakpoints";

import { MAX_TABLE_HEIGHT, RESIZE_TOOLTIP_CONFIG, TABLE_SIZES_CONFIG } from "./constants";

interface Props {
  tabs: { title: string; disabled: boolean }[];
  children: React.ReactNode;
  activeTab: number;
  onTabClick: (index: number) => void;
}

export const BaseTable: React.FC<Props> = observer(({ tabs, activeTab, onTabClick, children }) => {
  const { settingsStore } = useStores();

  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const tooltipConfig: Config = {
    ...RESIZE_TOOLTIP_CONFIG,
    visible: isTooltipVisible,
    onVisibleChange: setIsTooltipVisible,
  };

  const handleTableSize = (size: TRADE_TABLE_SIZE) => {
    settingsStore.setTradeTableSize(size);
    setIsTooltipVisible(false);
  };

  return (
    <Root gap="16px" size={settingsStore.tradeTableSize} column>
      <TableRoot>
        <TabContainer>
          {tabs.map(({ title, disabled }, index) => (
            <Tab
              key={title + index}
              active={activeTab === index}
              disabled={disabled}
              onClick={() => !disabled && onTabClick(index)}
            >
              {title}
            </Tab>
          ))}
          <TableSizeSelector>
            <Tooltip
              config={tooltipConfig}
              content={
                <div>
                  {TABLE_SIZES_CONFIG.map(({ size, icon, title }) => (
                    <TableSize
                      key={title}
                      active={settingsStore.tradeTableSize === size}
                      onClick={() => handleTableSize(size)}
                    >
                      <img alt={title} src={icon} />
                      <SizedBox width={4} />
                      <Text type={TEXT_TYPES.BUTTON} nowrap>
                        {title.toUpperCase()}
                      </Text>
                    </TableSize>
                  ))}
                </div>
              }
            >
              <img
                alt="Table Size"
                src={tableSizeSelector}
                style={{ cursor: "pointer" }}
                onClick={() => setIsTooltipVisible(true)}
              />
            </Tooltip>
          </TableSizeSelector>
        </TabContainer>
        <TableContainer className="better-scroll">{children}</TableContainer>
      </TableRoot>
    </Root>
  );
});

const TableRoot = styled.div`
  background: ${({ theme }) => theme.colors.bgSecondary};
  display: flex;
  width: 100%;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.bgSecondary};
  flex: 1;
  border-radius: 10px;
  max-width: 100%;
  height: 100%;

  ${media.mobile} {
    flex: initial;
  }
`;

const Root = styled(SmartFlex)<{ size: TRADE_TABLE_SIZE }>`
  width: 100%;
  height: ${({ size }) => MAX_TABLE_HEIGHT[size]};
  transition: height 200ms;

  ${media.mobile} {
    height: fit-content;
  }
`;

const TabContainer = styled(Row)`
  align-items: center;
  padding: 0 12px;
  height: 32px;
  position: relative;

  ${Tab} {
    margin: 0 12px;
  }
`;

const TableSizeSelector = styled.div`
  position: absolute;
  right: 12px;
  top: 4px;

  ${media.mobile} {
    display: none;
  }
`;

const TableContainer = styled(SmartFlex)`
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`;

const TableSize = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 4px 12px;
  width: 100%;
  cursor: pointer;

  ${({ active, theme }) => active && `background: ${theme.colors.borderPrimary}`};

  :hover {
    background: ${({ theme }) => theme.colors.borderSecondary};
  }
`;
