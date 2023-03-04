import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";
import Input from "@src/components/Input";
import SizedBox from "@components/SizedBox";
import { TOKENS_BY_SYMBOL, TOKENS_LIST } from "@src/constants";
import { Row } from "@src/components/Flex";
import Text from "@components/Text";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: pairs;
  background: #222936;
  padding: 12px 16px;
`;
const PairRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  margin: 3px 0;
  text-align: center;

  p:last-of-type {
    text-align: end;
  }

  p:first-of-type {
    text-align: start;
  }
`;

const Tokens = styled(Row)`
  p {
    cursor: pointer;
    margin-right: 7px;

    :hover {
      color: #25b05b;
    }
  }
`;
const allPairs = [
  {
    token0: TOKENS_BY_SYMBOL.UNI,
    token1: TOKENS_BY_SYMBOL.BTC,
    lastPrice: "0.00",
    change: "2.0",
  },
  {
    token0: TOKENS_BY_SYMBOL.ETH,
    token1: TOKENS_BY_SYMBOL.BTC,
    lastPrice: "0.00",
    change: "2.0",
  },
  {
    token0: TOKENS_BY_SYMBOL.ETH,
    token1: TOKENS_BY_SYMBOL.USDC,
    lastPrice: "0.00",
    change: "2.0",
  },
  {
    token0: TOKENS_BY_SYMBOL.BTC,
    token1: TOKENS_BY_SYMBOL.USDC,
    lastPrice: "0.00",
    change: "2.0",
  },
];
const PairsList: React.FC<IProps> = () => {
  const vm = useTradeVM();
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
      <Tokens>
        {TOKENS_LIST.map(({ assetId, symbol }) => (
          <Text
            fitContent
            key={assetId}
            onClick={() => setTokenFilter(assetId)}
            type={tokenFilter === assetId ? "green" : "primary"}
          >
            {symbol}
          </Text>
        ))}
      </Tokens>
      <SizedBox height={12} />
      <PairRow>
        <Text type="secondary">Pair</Text>
        <Text type="secondary">Last Price</Text>
        <Text type="secondary">Change</Text>
      </PairRow>
      {allPairs.map(({ token0, token1, lastPrice, change }, index) => (
        <PairRow key={index + "stat"}>
          <Text
            style={{ cursor: "pointer" }}
            onClick={() => {
              console.log(token0.symbol);
              console.log(token1.assetId);
              vm.setAssetId0(token0.symbol);
              vm.setAssetId1(token1.assetId);
            }}
          >{`${token0.symbol}/${token1.symbol}`}</Text>
          <Text>{lastPrice}</Text>
          <Text>{change}%</Text>
        </PairRow>
      ))}
    </Root>
  );
};
export default observer(PairsList);
