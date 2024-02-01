import { breakpoints, BreakPointTypes } from "@src/themes/breakpoints";

import { useWindowSize } from "./useWindowSize";

type TMediaBreakpoints = Record<BreakPointTypes, boolean>;
interface IMedia extends TMediaBreakpoints {
  currentMedia: BreakPointTypes;
}

export const useMedia = (): IMedia => {
  const { width } = useWindowSize();
  const media: TMediaBreakpoints = {
    mobile: width <= breakpoints.mobile,
    desktop: width > breakpoints.mobile,
  };

  const currentMedia = Object.keys(media).filter((key) => media[key as BreakPointTypes]) as BreakPointTypes[];

  return {
    ...media,
    currentMedia: currentMedia[0],
  };
};
