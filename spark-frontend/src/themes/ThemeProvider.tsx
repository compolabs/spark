import React from "react";
import {ThemeProvider} from "@emotion/react";

import {useStores} from "@stores";
import {darkThemeColors} from "@src/themes/colors";
import {observer} from "mobx-react";

export enum THEME_TYPE {
    // LIGHT_THEME = "lightTheme",
    DARK_THEME = "darkTheme",
}

interface IProps {
    children: React.ReactNode;
}

export const themes = {
    darkTheme: {colors: darkThemeColors},
    // lightTheme,
};
//todo fix
const ThemeWrapper: React.FC<IProps> = observer(({children}) => {
    const {settingsStore} = useStores();
    return (
        <ThemeProvider theme={themes[settingsStore.selectedTheme]}>
            {children}
        </ThemeProvider>
    );
});

export default ThemeWrapper;
