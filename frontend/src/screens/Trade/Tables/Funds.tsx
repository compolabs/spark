import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 16px;
`;
// const FundRow = styled.div`
//   display: grid;
//   grid-template-columns: repeat(4, 1fr);
// `;
const Funds: React.FC<IProps> = () => {
  // const columns = ["Token", "Token Balance", "Available", "In Orders"];
  return (
    <Root>
      <Text size="small">Soon</Text>
      {/*<FundRow>*/}
      {/*  {columns.map((value) => (*/}
      {/*    <Text size="small" key={value}>*/}
      {/*      {value}*/}
      {/*    </Text>*/}
      {/*  ))}*/}
      {/*</FundRow>*/}
      {/*<SizedBox height={8} />*/}
      {/*{accountStore.balances.map(({ assetId, balance }) => {*/}
      {/*  const token = TOKENS_BY_ASSET_ID[assetId];*/}
      {/*  console.log(token.assetId);*/}
      {/*  return (*/}
      {/*    <FundRow key={assetId}>*/}
      {/*      <Text size="small">{token.symbol}</Text>*/}
      {/*      <Text size="small">*/}
      {/*        {BN.formatUnits(balance ?? 0, token.decimals).toFormat(2)}*/}
      {/*      </Text>*/}
      {/*      <Text size="small">*/}
      {/*        {BN.formatUnits(balance ?? 0, token.decimals).toFormat(2)}*/}
      {/*      </Text>{" "}*/}
      {/*      <Text size="small">0.00</Text>*/}
      {/*    </FundRow>*/}
      {/*  );*/}
      {/*})}*/}
    </Root>
  );
};
export default observer(Funds);
