import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";
import Input from "@src/components/Input";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: pairs;
  background: #222936;
`;

const PairsList: React.FC<IProps> = () => {
  const vm = useTradeVM();
  return (
    <Root>
      <Input
        style={{ height: 40 }}
        // icon="search"
        placeholder="Search by title or asset…"
        value={vm.searchValue}
        onChange={(e) => vm.setSearchValue(e.target.value)}
        suffixCondition={vm.searchValue.length > 1}
      />
    </Root>
  );
};
export default observer(PairsList);
