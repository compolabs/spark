import { useState } from "react";

import { useEventListener } from "@src/hooks/useEventListener";

interface Size {
  width: number;
  height: number;
}

export const useWindowSize = (): Size => {
  const [windowSize, setWindowSize] = useState<Size>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEventListener("resize", () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  });

  return windowSize;
};
