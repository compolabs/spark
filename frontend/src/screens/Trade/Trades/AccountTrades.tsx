import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const AccountTrades: React.FC<IProps> = () => {
  return (
    <Root>
      <Text textAlign="center">Coming soon</Text>
    </Root>
  );
};
export default AccountTrades;
