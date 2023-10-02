import styled from "@emotion/styled";
import React from "react";
import logo from '@src/logo.svg';

interface IProps {
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid white;
  width: 100%;
  flex: 3;
  box-sizing: border-box;

  .App-logo {
    height: 20vmin;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: no-preference) {
    .App-logo {
      animation: App-logo-spin infinite 20s linear;
    }
  }
  
  @keyframes App-logo-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

`;

const Chart: React.FC<IProps> = () => {
    return <Root>
        <img src={logo} className="App-logo" alt="logo"/>
    </Root>;
}
export default Chart;
