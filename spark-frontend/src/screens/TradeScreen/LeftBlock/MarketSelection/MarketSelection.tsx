import React, { useRef, useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import Button, { ButtonGroup } from "@components/Button";
import Divider from "@components/Divider";
import { Row } from "@components/Flex";
import SearchInput from "@components/SearchInput";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import MarketRow from "@src/screens/TradeScreen/LeftBlock/MarketSelection/MarketRow";
import { useStores } from "@stores";

interface IProps {}

const MarketSelection: React.FC<IProps> = observer(() => {
  const { tradeStore } = useStores();
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSpotMarket, setSpotMarket] = useState(true);
  const rootRef = useRef(null);

  // todo: Придумать решение, предыдущий фикс не помог. Проблема в том что одновременно срабатывает useOnClickOutside и наоборот открытие.
  // useOnClickOutside(rootRef, () => tradeStore.setMarketSelectionOpened(false));

  return (
    <Root ref={rootRef}>
      <Top>
        <ButtonGroup>
          <Button active={isSpotMarket} onClick={() => setSpotMarket(true)}>
            SPOT
          </Button>
          <Button active={!isSpotMarket} onClick={() => setSpotMarket(false)}>
            PERP
          </Button>
        </ButtonGroup>
        <SizedBox height={16} />
        <SearchInput value={searchValue} onChange={(v) => setSearchValue(v)} />
      </Top>
      <SizedBox height={24} />
      <Row justifyContent="space-between" style={{ padding: "0 12px", boxSizing: "border-box" }}>
        <Text type={TEXT_TYPES.BODY}>MARKET</Text>
        <Text type={TEXT_TYPES.BODY}>PRICE</Text>
      </Row>
      <SizedBox height={12} />
      <Divider />
      {isSpotMarket && tradeStore.spotMarkets.length === 0 && (
        <>
          <SizedBox height={16} />
          <Row justifyContent="center">
            <Text>No spot markets found</Text>
          </Row>
        </>
      )}
      {!isSpotMarket && (
        <>
          <SizedBox height={16} />
          <Row justifyContent="center">
            <Text>No perp markets found</Text>
          </Row>
        </>
      )}

      {(isSpotMarket ? tradeStore.spotMarkets : []).map((market) => (
        <MarketRow key={market.symbol} market={market} />
      ))}
    </Root>
  );
});

export default MarketSelection;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Top = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
`;
