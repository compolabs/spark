import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";
import Input from "@src/components/Input";
import SizedBox from "@components/SizedBox";
import { IToken, TOKENS_BY_SYMBOL, TOKENS_LIST } from "@src/constants";
import { Row } from "@src/components/Flex";
import Text from "@components/Text";
import { useStores } from "@stores";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: pairs;
  background: #222936;
  padding: 12px 16px 0 16px;
`;

const Title = styled(Text)`
  font-family: "Roboto", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  color: #959dae;
  text-align: left;
`;

const TitleRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  text-align: center;

  p:last-of-type {
    text-align: end;
  }

  p:first-of-type {
    text-align: start;
  }
`;

const PairRow = styled(TitleRow)`
  padding: 6px 0;
  border-radius: 4px;
  transition: 0.4s;

  :hover {
    background: #323846;
  }
`;

const TokensFilterItem = styled(Text)<{ active: boolean }>`
  font-family: "Roboto", sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  cursor: pointer;
  margin-right: 7px;
  transition: 0.4s;
  width: fit-content;
  color: ${({ active }) => (active ? "#FFFFFF" : "#B7BFD1")};
  :hover {
    color: #fff;
  }
`;

const PairText = styled(Title)`
  color: #fff;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: scroll;
  -ms-overflow-style: none;
  padding-bottom: 6px;
`;

type TPair = {
  token0: IToken;
  token1: IToken;
  lastPrice: string;
  change: string;
};

const allPairs = Object.keys(TOKENS_BY_SYMBOL).reduce((acc, symbol0, _, arr) => {
  const batch = arr
    .filter((symbol1) => symbol1 !== symbol0)
    .map((symbol1) => ({
      token0: TOKENS_BY_SYMBOL[symbol0],
      token1: TOKENS_BY_SYMBOL[symbol1],
      lastPrice: "",
      change: "",
    }));
  return [...acc, ...batch];
}, [] as Array<TPair>);

const PairsList: React.FC<IProps> = () => {
  const vm = useTradeVM();
  const { accountStore } = useStores();
  const [tokenFilter, setTokenFilter] = useState<string | null>(null);
  return (
    <Root>
      <Input
        style={{ height: 40 }}
        placeholder="Search"
        value={vm.searchValue}
        onChange={(e) => vm.setSearchValue(e.target.value)}
        suffixCondition={vm.searchValue.length > 1}
      />
      <SizedBox height={12} />
      <Row>
        {TOKENS_LIST.map(({ assetId, symbol }) => (
          <TokensFilterItem
            onClick={() => setTokenFilter(assetId)}
            key={assetId}
            active={tokenFilter === assetId}
          >
            {symbol}
          </TokensFilterItem>
        ))}
      </Row>
      <SizedBox height={12} />
      <TitleRow>
        <Title style={{ paddingLeft: 8 }}>Pair</Title>
        <Title>Last Price</Title>
        <Title textAlign="right">Change</Title>
      </TitleRow>
      <Container>
        {allPairs.map(({ token0, token1, lastPrice, change }, index) => (
          <PairRow
            key={index + "stat"}
            style={{
              cursor: index === 0 ? "pointer" : "not-allowed",
              opacity: index === 0 ? 1 : 0.5,
            }}
            onClick={() => {
              if (index !== 0) return; //TODO
              if (accountStore.isLoggedIn) {
                vm.setAssetId0(token0.assetId);
                vm.setAssetId1(token1.assetId);
              }
            }}
          >
            <PairText style={{ paddingLeft: 8 }}>{`${token0.symbol}/${token1.symbol}`}</PairText>
            <PairText>{lastPrice}</PairText>
            <PairText>{change}%</PairText>
          </PairRow>
        ))}
      </Container>
    </Root>
  );
};
export default observer(PairsList);
