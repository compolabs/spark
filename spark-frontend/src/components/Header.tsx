import styled from "@emotion/styled";
import React from "react";

interface IProps {}

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  box-sizing: border-box;
  border: 1px solid white;
`;

const Header: React.FC<IProps> = () => {
  return <Root>
    <h1>spark</h1>
    <button>Connect wallet</button>
  </Root>;
}
export default Header;
