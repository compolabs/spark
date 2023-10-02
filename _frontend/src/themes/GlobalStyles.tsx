import React from "react";
import { css, Global, useTheme } from "@emotion/react";

const globalModalStyles = (theme: any) => `

body {
    margin: 0;
    font-family: "Roboto", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #292F3C;
}

.rc-dialog-mask {
     background: rgba(0, 0, 0, 0.4);
}

.rc-dialog-wrap {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    display: flex;
}

.rc-dialog {
    width: calc(100% - 32px);
}

.rc-dialog-content {
    background: #292F3C ;
    border: 1px solid #292F3C ;
    box-shadow: 0px 8px 56px rgba(54, 56, 112, 0.16);
    border-radius: 4px;
    overflow: hidden;
    min-height: 230px;
    padding: 0;
}

.rc-dialog-header {
    border-bottom: 1px solid #4B5364;
    background: #292F3C ;
    padding: 16px 24px;
    max-height: 56px;
} 

.rc-dialog-body {
    padding: 16px 24px 0 24px;
}

.rc-dialog-title {
    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #FFFFFF;
}


.rc-dialog-close {
    opacity: 1;
}

.rc-notification {
    top: 30px;
    right: 16px;
}

.rc-notification-notice {
 background: ${theme.colors.notifications.background};
 box-shadow: ${theme.colors.notifications.boxShadow}
}

.rc-notification-notice-content {
    display: flex;
    background: ${theme.colors.notifications.background};
}

.custom-notification .rc-notification-notice-close {
    opacity: 1;
    top: 16px;
    right: 16px;
}

.custom-notification .rc-notification-notice-close > svg > path {
    fill: ${theme.colors.grey100};
}

.recharts-default-tooltip { 

background-color: ${theme.colors.mainBackground} !important;

}

.react-loading-skeleton {

--base-color: ${theme.colors.skeleton.base};
--highlight-color: ${theme.colors.skeleton.highlight};

}

.notifications-text {
 color: ${theme.colors.text};
}


`;

const GlobalStyles: React.FC = () => {
  const theme = useTheme();
  return <Global styles={css(globalModalStyles(theme))} />;
};

export default GlobalStyles;
