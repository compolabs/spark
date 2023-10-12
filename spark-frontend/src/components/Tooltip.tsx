import styled from "@emotion/styled";
import React, { CSSProperties } from "react";
import { usePopperTooltip } from "react-popper-tooltip";
import { Config } from "react-popper-tooltip/dist/types";

interface IProps {
  content: string | JSX.Element;
  config?: Config;
  fixed?: boolean;
  containerStyles?: CSSProperties;
  children: React.ReactNode;
}

const Root = styled.div<{ fixed?: boolean }>`
  display: flex;
  background: ${({ theme }) => `${theme.colors.gray5}`};
  width: 100%;
  z-index: 2;
  box-sizing: border-box;
  padding: 8px 16px 12px;
  border: 1px solid ${({ theme }) => `${theme.colors.gray1}`};
  border-radius: 4px;
  height: auto;
  overflow-y: auto;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: fit-content;
`;
const Tooltip: React.FC<IProps> = ({ containerStyles, children, content, config }) => {
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ ...config });
  return (
    <Container>
      <div ref={setTriggerRef} style={{ cursor: "pointer", position: "relative", ...containerStyles }}>
        {children}
        {visible && (
          <Root ref={setTooltipRef} {...getTooltipProps()}>
            {content}
          </Root>
        )}
      </div>
    </Container>
  );
};
export default Tooltip;
