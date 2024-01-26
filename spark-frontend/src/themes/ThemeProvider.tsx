import React from "react";
import { ThemeProvider } from "@emotion/react";
import { observer } from "mobx-react";

import darkTheme from "@src/themes/darkTheme";
import { useStores } from "@stores";

export enum THEME_TYPE {
  DARK_THEME = "darkTheme",
}

interface IProps {
  children: React.ReactNode;
}

export const themes = {
  darkTheme,
};
const ThemeWrapper: React.FC<IProps> = observer(({ children }) => {
  const { settingsStore } = useStores();
  return <ThemeProvider theme={themes[settingsStore.selectedTheme]}>{children}</ThemeProvider>;
});

export default ThemeWrapper;
