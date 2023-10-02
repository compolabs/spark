import { themes } from '@src/themes/ThemeProvider';

import '@emotion/react';

export type TColorType =
  | typeof themes.darkTheme.colors
  | typeof themes.lightTheme.colors;
export type TImagesType =
  | typeof themes.darkTheme.images
  | typeof themes.lightTheme.images;
export type TSvgType =
  | typeof themes.darkTheme.svg
  | typeof themes.lightTheme.svg;

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface Theme {
    colors: TColorType;
    images: TImagesType;
    svg: TSvgType;
  }
}
