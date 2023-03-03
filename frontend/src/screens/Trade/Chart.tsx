import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: chart;
  background: #222936;
  width: 100%;
  justify-content: center;
  align-items: center;

  height: 410px;

  @media (min-width: 880px) {
    height: unset;
  }
`;

const Chart: React.FC<IProps> = () => {
  return (
    <Root>
      <Text>Chart will be here</Text>
    </Root>
  );
};
export default Chart;
