import { RefObject, useEffect } from "react";

type TAnyEvent = MouseEvent | TouchEvent;

function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: TAnyEvent) => void
): void {
  useEffect(() => {
    const listener = (event: TAnyEvent) => {
      const el = ref?.current;

      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener(`mousedown`, listener);
    document.addEventListener(`touchstart`, listener);

    return () => {
      document.removeEventListener(`mousedown`, listener);
      document.removeEventListener(`touchstart`, listener);
    };
  }, [ref, handler]);
}

export default useOnClickOutside;
