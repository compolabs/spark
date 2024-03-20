import React, { useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button, { ButtonGroup } from "@components/Button";
import Divider from "@components/Divider";
import { Row } from "@components/Flex";
import SearchInput from "@components/SearchInput";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import { SmartFlex } from "@src/components/SmartFlex";
import SpotMarketRow from "@src/screens/TradeScreen/LeftBlock/MarketSelection/SpotMarketRow";
import { useStores } from "@stores";

import PerpMarketRow from "./PerpMarketRow";

interface IProps {}

const MarketSelection: React.FC<IProps> = observer(() => {
  const { tradeStore } = useStores();
  const [searchValue, setSearchValue] = useState("");
  const [isSpotMarket, setSpotMarket] = useState(true);
  const rootRef = useRef(null);

  // todo: Придумать решение, предыдущий фикс не помог. Проблема в том что одновременно срабатывает useOnClickOutside и наоборот открытие.
  // useOnClickOutside(rootRef, () => tradeStore.setMarketSelectionOpened(false));

  const spotMarketsFiltered = useMemo(
    () =>
      tradeStore.spotMarkets.filter((market) => {
        return searchValue.length ? market.symbol.includes(searchValue) : true;
      }),
    [tradeStore.spotMarkets, searchValue],
  );

  const perpMarketsFiltered = useMemo(
    () =>
      tradeStore.perpMarkets.filter((market) => {
        return searchValue.length ? market.symbol.includes(searchValue) : true;
      }),
    [tradeStore.perpMarkets, searchValue],
  );

  const renderSpotMarketList = () => {
    if (!isSpotMarket) return;

    if (!spotMarketsFiltered.length) {
      return (
        <>
          <SizedBox height={16} />
          <Row justifyContent="center">
            <Text>No spot markets found</Text>
          </Row>
        </>
      );
    }

    return spotMarketsFiltered.map((market) => <SpotMarketRow key={market.symbol} market={market} />);
  };

  const renderPerpMarketList = () => {
    if (isSpotMarket) return;

    if (!perpMarketsFiltered.length) {
      return (
        <>
          <SizedBox height={16} />
          <Row justifyContent="center">
            <Text>No spot markets found</Text>
          </Row>
        </>
      );
    }

    return perpMarketsFiltered.map((market) => <PerpMarketRow key={market.symbol} market={market} />);
  };

  return (
    <Root ref={rootRef}>
      <SearchContainer>
        <ButtonGroup>
          <Button active={isSpotMarket} onClick={() => setSpotMarket(true)}>
            SPOT
          </Button>
          <Button active={!isSpotMarket} onClick={() => setSpotMarket(false)}>
            PERP
          </Button>
        </ButtonGroup>
        <SizedBox height={16} />
        <SearchInput value={searchValue} onChange={setSearchValue} />
      </SearchContainer>
      <SizedBox height={24} />
      <SmartFlex justifyContent="space-between" padding="0 12px">
        <Text type={TEXT_TYPES.BODY}>MARKET</Text>
        <Text type={TEXT_TYPES.BODY}>PRICE</Text>
      </SmartFlex>
      <SizedBox height={12} />
      <Divider />
      {renderSpotMarketList()}
      {renderPerpMarketList()}
    </Root>
  );
});

export default MarketSelection;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
`;
