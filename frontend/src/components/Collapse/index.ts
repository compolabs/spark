import { useState, useRef, TransitionEvent, CSSProperties } from "react";
import { flushSync } from "react-dom";
import {
  noop,
  callAll,
  getElementHeight,
  getAutoHeightDuration,
  mergeRefs,
  usePaddingWarning,
  useUniqueId,
  useEffectAfterMount,
  useControlledState,
} from "./utils";
import {
  UseCollapseInput,
  UseCollapseOutput,
  GetCollapsePropsOutput,
  GetCollapsePropsInput,
  GetTogglePropsOutput,
  GetTogglePropsInput,
} from "./types";

const easeInOut = "cubic-bezier(0.4, 0, 0.2, 1)";

export default function useCollapse({
  duration,
  easing = easeInOut,
  collapseStyles = {},
  expandStyles = {},
  onExpandStart = noop,
  onExpandEnd = noop,
  onCollapseStart = noop,
  onCollapseEnd = noop,
  isExpanded: configIsExpanded,
  defaultExpanded = false,
  hasDisabledAnimation = false,
  ...initialConfig
}: UseCollapseInput = {}): UseCollapseOutput {
  const [isExpanded, setExpanded] = useControlledState(
    configIsExpanded,
    defaultExpanded
  );
  const uniqueId = useUniqueId();
  const el = useRef<HTMLElement | null>(null);
  usePaddingWarning(el);
  const collapsedHeight = `${initialConfig.collapsedHeight || 0}px`;
  const collapsedStyles = {
    display: collapsedHeight === "0px" ? "none" : "block",
    height: collapsedHeight,
    overflow: "hidden",
  };
  const [styles, setStylesRaw] = useState<CSSProperties>(
    isExpanded ? {} : collapsedStyles
  );
  const setStyles = (newStyles: {} | ((oldStyles: {}) => {})): void => {
    // We rely on reading information from layout
    // at arbitrary times, so ensure all style changes
    // happen before we might attempt to read them.
    flushSync(() => {
      setStylesRaw(newStyles);
    });
  };
  const mergeStyles = (newStyles: {}): void => {
    setStyles((oldStyles) => ({ ...oldStyles, ...newStyles }));
  };

  function getTransitionStyles(height: number | string): CSSProperties {
    if (hasDisabledAnimation) {
      return {};
    }
    const _duration = duration || getAutoHeightDuration(height);
    return {
      transition: `height ${_duration}ms ${easing}`,
    };
  }

  useEffectAfterMount(() => {
    if (isExpanded) {
      requestAnimationFrame(() => {
        onExpandStart();
        mergeStyles({
          ...expandStyles,
          willChange: "height",
          display: "block",
          overflow: "hidden",
        });
        requestAnimationFrame(() => {
          const height = getElementHeight(el);
          mergeStyles({
            ...getTransitionStyles(height),
            height,
          });
        });
      });
    } else {
      requestAnimationFrame(() => {
        onCollapseStart();
        const height = getElementHeight(el);
        mergeStyles({
          ...collapseStyles,
          ...getTransitionStyles(height),
          willChange: "height",
          height,
        });
        requestAnimationFrame(() => {
          mergeStyles({
            height: collapsedHeight,
            overflow: "hidden",
          });
        });
      });
    }
  }, [isExpanded, collapsedHeight]);

  const handleTransitionEnd = (e: TransitionEvent): void => {
    // Sometimes onTransitionEnd is triggered by another transition,
    // such as a nested collapse panel transitioning. But we only
    // want to handle this if this component's element is transitioning
    if (e.target !== el.current || e.propertyName !== "height") {
      return;
    }

    // The height comparisons below are a final check before
    // completing the transition
    // Sometimes this callback is run even though we've already begun
    // transitioning the other direction
    // The conditions give us the opportunity to bail out,
    // which will prevent the collapsed content from flashing on the screen
    if (isExpanded) {
      const height = getElementHeight(el);

      // If the height at the end of the transition
      // matches the height we're animating to,
      if (height === styles.height) {
        setStyles({});
      } else {
        // If the heights don't match, this could be due the height
        // of the content changing mid-transition
        mergeStyles({ height });
      }

      onExpandEnd();

      // If the height we should be animating to matches the collapsed height,
      // it's safe to apply the collapsed overrides
    } else if (styles.height === collapsedHeight) {
      setStyles(collapsedStyles);
      onCollapseEnd();
    }
  };

  function getToggleProps({
    disabled = false,
    onClick = noop,
    ...rest
  }: GetTogglePropsInput = {}): GetTogglePropsOutput {
    return {
      type: "button",
      role: "button",
      id: `react-collapsed-toggle-${uniqueId}`,
      "aria-controls": `react-collapsed-panel-${uniqueId}`,
      "aria-expanded": isExpanded,
      tabIndex: 0,
      disabled,
      ...rest,
      onClick: disabled ? noop : callAll(onClick, () => setExpanded((n) => !n)),
    };
  }

  function getCollapseProps({
    style = {},
    onTransitionEnd = noop,
    refKey = "ref",
    ...rest
  }: GetCollapsePropsInput = {}): GetCollapsePropsOutput {
    const theirRef: any = rest[refKey];
    return {
      id: `react-collapsed-panel-${uniqueId}`,
      "aria-hidden": !isExpanded,
      ...rest,
      [refKey]: mergeRefs(el, theirRef),
      onTransitionEnd: callAll(handleTransitionEnd, onTransitionEnd),
      style: {
        boxSizing: "border-box",
        // additional styles passed, e.g. getCollapseProps({style: {}})
        ...style,
        // style overrides from state
        ...styles,
      },
    };
  }

  return {
    getToggleProps,
    getCollapseProps,
    isExpanded,
    setExpanded,
  };
}
