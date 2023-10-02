import React from "react";
import PerfectScrollbar, { ScrollBarProps } from "react-perfect-scrollbar";

import { ScrollbarRoot } from "./styles";

interface IScrollbarProps extends ScrollBarProps {
  onScrollX?: (ref: any) => void;
  suppressScrollX?: boolean;
  suppressScrollY?: boolean;
  containerRef?: (ref: HTMLElement) => void;
}

const Scrollbar: React.FC<IScrollbarProps> = ({
  children,
  suppressScrollX,
  suppressScrollY,
  containerRef,
  onScrollX,
  className,
  ...rest
}) => (
  <ScrollbarRoot className={className}>
    <PerfectScrollbar
      containerRef={containerRef}
      options={{
        suppressScrollX,
        suppressScrollY,
        useBothWheelAxes: true,
      }}
      onScrollX={onScrollX}
      {...rest}
    >
      {children}
    </PerfectScrollbar>
  </ScrollbarRoot>
);
export default Scrollbar;
