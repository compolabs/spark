import type {
  ReactNode,
  CSSProperties,
  TransitionEvent,
  MouseEvent,
  MutableRefObject,
} from "react";

type ButtonType = "submit" | "reset" | "button";
type AriaBoolean = boolean | "true" | "false";

/**
 * React.Ref uses the readonly type `React.RefObject` instead of
 * `React.MutableRefObject`, We pretty much always assume ref objects are
 * mutable (at least when we create them), so this type is a workaround so some
 * of the weird mechanics of using refs with TS.
 */
export type AssignableRef<ValueType> =
  | {
      bivarianceHack(instance: ValueType | null): void;
    }["bivarianceHack"]
  | MutableRefObject<ValueType | null>;

export interface GetTogglePropsOutput {
  disabled: boolean;
  type: ButtonType;
  role: string;
  id: string;
  "aria-controls": string;
  "aria-expanded": AriaBoolean;
  tabIndex: number;
  onClick: (e: MouseEvent) => void;
}

export interface GetTogglePropsInput {
  [key: string]: unknown;
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
}

export interface GetCollapsePropsOutput {
  id: string;
  onTransitionEnd: (e: TransitionEvent) => void;
  style: CSSProperties;
  "aria-hidden": AriaBoolean;
}

export interface GetCollapsePropsInput {
  [key: string]: unknown;
  style?: CSSProperties;
  onTransitionEnd?: (e: TransitionEvent) => void;
  refKey?: string;
  ref?: (node: ReactNode) => void | null | undefined;
}

export interface UseCollapseInput {
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  collapsedHeight?: number;
  expandStyles?: {};
  collapseStyles?: {};
  easing?: string;
  duration?: number;
  onCollapseStart?: () => void;
  onCollapseEnd?: () => void;
  onExpandStart?: () => void;
  onExpandEnd?: () => void;
  hasDisabledAnimation?: boolean;
}

export interface UseCollapseOutput {
  getCollapseProps: (config?: GetCollapsePropsInput) => GetCollapsePropsOutput;
  getToggleProps: (config?: GetTogglePropsInput) => GetTogglePropsOutput;
  isExpanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}
