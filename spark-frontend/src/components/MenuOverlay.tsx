import React, { useLayoutEffect } from "react";
import styled from "@emotion/styled";

import { SmartFlex } from "./SmartFlex";

interface IProps {
  isOpen: boolean;
  top?: number;
  offsetTop?: number;
  zIndex?: number;
  children?: React.ReactNode;
}

const MenuOverlay: React.FC<IProps> = ({ isOpen, children, top = 0, offsetTop = 0, zIndex = 200 }) => {
  const fullOffset = top + offsetTop;

  useLayoutEffect(() => {
    document.body.classList.toggle("noscroll", isOpen);

    return () => {
      document.body.classList.remove("noscroll");
    };
  }, [isOpen]);

  return (
    <Root fullOffset={fullOffset} isOpen={isOpen} top={top} zIndex={zIndex}>
      {children}
    </Root>
  );
};

export default MenuOverlay;

const Root = styled(SmartFlex)<{ zIndex: number; isOpen: boolean; top: number; fullOffset: number }>`
  z-index: ${({ zIndex }) => zIndex};
  background: ${({ theme }) => `${theme.colors.bgPrimary}`};
  position: absolute;
  top: ${({ top }) => `${top}px`};
  left: 0;
  right: 0;
  transition: 0.2s;
  overflow: hidden;

  height: ${({ isOpen, fullOffset }) => (isOpen ? `calc(100vh - ${fullOffset}px)` : "0")};
  height: ${({ isOpen, fullOffset }) => (isOpen ? `calc(100dvh - ${fullOffset}px)` : "0")};

  box-sizing: border-box;
  padding: 0 4px;
`;
