import React from "react";
import { ThemeProvider } from "@emotion/react";

import darkTheme from "@src/themes/darkTheme";
import { Observer } from "mobx-react-lite";

// export enum THEME_TYPE {
//   LIGHT_THEME = "lightTheme",
//   DARK_THEME = "darkTheme",
// }

interface IProps {
  children: React.ReactNode;
}

export const themes = {
  darkTheme,
  lightTheme: darkTheme,
};
const ThemeWrapper: React.FC<IProps> = ({ children }) => {
  return (
    <Observer>{() => <ThemeProvider theme={themes.darkTheme}>{children}</ThemeProvider>}</Observer>
  );
};

export default ThemeWrapper;
