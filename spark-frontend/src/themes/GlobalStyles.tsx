import React from "react";
import { css, Global, Theme, useTheme } from "@emotion/react";

const globalModalStyles = (theme: Theme) => css`
  * {
    box-sizing: border-box;
  }

  .rc-dialog-mask {
    background: rgba(5, 5, 5, 0.5);
    backdrop-filter: blur(5px);
  }

  .rc-dialog-wrap {
    flex-direction: column;
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .rc-dialog {
    margin: 0;
    width: 100%;
    max-width: 414px;
    background: ${theme.colors.bgSecondary};
    border-radius: 10px;
  }

  .rc-dialog-content {
    border-radius: 10px;
    background: ${theme.colors.bgSecondary};
  }

  .rc-dialog-body {
    padding: 0;
    box-sizing: border-box;
  }

  .rc-dialog-header {
    padding: unset;
    background: ${theme.colors.bgSecondary};
    color: ${theme.colors.textPrimary};
    border: none;
  }

  .rc-dialog-close {
    opacity: 1;
    top: 8px;
    right: 8px;
    width: 40px;
    height: 40px;
    display: none;
  }

  @media (min-width: 400px) {
    .rc-dialog-close {
      right: 0;
    }
  }
`;

const GlobalStyles: React.FC = () => {
  const theme = useTheme();

  return <Global styles={globalModalStyles(theme)} />;
};

export default GlobalStyles;
