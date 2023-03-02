import styled from "@emotion/styled";
import React, { CSSProperties } from "react";
import Text from "@src/components/Text";

type ITab = {
  name: string;
  additionalInfo?: string | number;
};

interface IProps {
  tabs: ITab[];
  activeTab: number;
  setActive: (index: number) => void;
  style?: CSSProperties;
  tabStyle?: CSSProperties;
}

const Root = styled.div`
  display: flex;
  border-bottom: 1px solid #4b5364;
  width: 100%;
`;
const Tab = styled.div<{ active?: boolean }>`
  text-align: center;
  margin-right: 24px;
  padding-bottom: 12px;
  border-bottom: 4px solid #7075e9;
  cursor: pointer;
  border-bottom: ${({ active }) =>
    active ? "4px solid #5A81EA" : "4px solid transparent"};
  margin-bottom: -1px;
  user-select: none;
  transition: 0.4s;

}
`;
const Tabs: React.FC<IProps> = ({
  tabs,
  activeTab,
  setActive,
  style,
  tabStyle,
}) => {
  return (
    <Root style={style}>
      {tabs.map(({ additionalInfo, name }, index) => (
        <Tab
          key={index}
          active={index === activeTab}
          onClick={() => setActive(index)}
          style={tabStyle}
        >
          <Text weight={500}>
            {name}
            {additionalInfo != null && additionalInfo !== 0 && (
              <span style={{ color: "#8082C5", marginLeft: 10 }}>
                {additionalInfo}
              </span>
            )}
          </Text>
        </Tab>
      ))}
    </Root>
  );
};
export default Tabs;
