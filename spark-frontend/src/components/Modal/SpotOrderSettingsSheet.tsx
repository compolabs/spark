import React from "react";
import styled from "@emotion/styled";

import BN from "@src/utils/BN";

import Sheet from "../Sheet";
import { SmartFlex } from "../SmartFlex";
import Text from "../Text";

interface Props {
  filterIcons: string[];
  decimals: number[];
  selectedFilter: number;
  selectedDecimal: string;
  isOpen: boolean;
  onFilterSelect: (index: number) => void;
  onDecimalSelect: (index: string) => void;
  onClose: () => void;
}

const SpotOrderSettingsSheet: React.FC<Props> = ({
  decimals,
  filterIcons,
  selectedFilter,
  selectedDecimal,
  onFilterSelect,
  onDecimalSelect,
  isOpen,
  onClose,
}) => {
  const handleFilterSelect = (index: number) => {
    onFilterSelect(index);
    onClose();
  };

  const handleDecimalsSelect = (index: string) => {
    onDecimalSelect(index);
    onClose();
  };

  const renderButtons = () => {
    return filterIcons.map((icon, index) => (
      <SettingIcon
        key={index}
        alt="filter"
        isActive={selectedFilter === index}
        src={icon}
        onClick={() => handleFilterSelect(index)}
      />
    ));
  };

  const renderDecimals = () => {
    return decimals.map((decimal, index) => (
      <DecimalItem
        key={index}
        isActive={selectedDecimal === index.toString()}
        onClick={() => handleDecimalsSelect(index.toString())}
      >
        <Text primary>{new BN(10).pow(-decimal).toString()}</Text>
      </DecimalItem>
    ));
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <SmartFlex margin="0 0 40px 0" column>
        <FilterContainer center="y">{renderButtons()}</FilterContainer>
        <DecimalsContainer center="y" column>
          {renderDecimals()}
        </DecimalsContainer>
      </SmartFlex>
    </Sheet>
  );
};

export default SpotOrderSettingsSheet;

const SettingIcon = styled.img<{ isActive?: boolean }>`
  cursor: pointer;
  transition: 0.4s;
  border-radius: 4px;
  border: 1px solid ${({ isActive, theme }) => (isActive ? theme.colors.borderAccent : "transparent")};

  &:hover {
    border: 1px solid ${({ isActive, theme }) => (isActive ? theme.colors.borderAccent : theme.colors.borderPrimary)};
  }
`;

const FilterContainer = styled(SmartFlex)`
  padding: 8px 24px;
  gap: 12px;
`;

const DecimalsContainer = styled(SmartFlex)``;

const DecimalItem = styled(SmartFlex)<{ isActive?: boolean }>`
  padding: 8px 24px;
  height: 40px;
  background-color: ${({ isActive, theme }) => (isActive ? theme.colors.borderPrimary : "unset")};

  ${Text} {
    display: flex;
    align-items: center;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.borderPrimary};
  }
`;
