import {themes} from "@src/themes/ThemeProvider";

import "@emotion/react";

export type TColorType = typeof themes.darkTheme.colors

declare module "@emotion/react" {
    export interface Theme {
        colors: TColorType;
    }
}
