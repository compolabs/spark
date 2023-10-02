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
  background: ${({ theme }) => `${theme.colors.tooltip.background}`};
  //max-width: 320px;
  //min-width: 160px;
  z-index: 10;
  width: max-content;
  box-sizing: border-box;
  padding: 0 16px;
  //padding: 16px;
  border: 2px solid ${({ theme }) => `${theme.colors.tooltip.border}`};
  border-radius: 4px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06), 0 16px 28px rgba(0, 0, 0, 0.07);
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: fit-content;
`;
const Tooltip: React.FC<IProps> = ({
  containerStyles,
  children,
  content,
  config,
}) => {
  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } =
    usePopperTooltip({ ...config });
  return (
    <Container>
      <div
        ref={setTriggerRef}
        style={{ cursor: "pointer", ...containerStyles }}
      >
        {children}
      </div>
      {visible && (
        <Root ref={setTooltipRef} {...getTooltipProps()}>
          {content}
        </Root>
      )}
    </Container>
  );
};
export default Tooltip;
