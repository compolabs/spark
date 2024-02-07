import React, { CSSProperties, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { usePopperTooltip } from "react-popper-tooltip";
import { Config } from "react-popper-tooltip/dist/types";
import styled from "@emotion/styled";

interface IProps {
  content: string | JSX.Element;
  config?: Config;
  fixed?: boolean;
  containerStyles?: CSSProperties;
  children: React.ReactNode;
}

const Tooltip: React.FC<IProps> = ({ containerStyles, children, content, config }) => {
  const { getTooltipProps, setTooltipRef, setTriggerRef, tooltipRef, triggerRef, visible } = usePopperTooltip({
    ...config,
  });

  const [triggerWidth, setTriggerWidth] = useState(0);

  useEffect(() => {
    if (visible && triggerRef) {
      setTriggerWidth(triggerRef.offsetWidth);
    }
  }, [visible, triggerRef]);

  const modifiedTooltipProps = getTooltipProps({
    style: { width: `${triggerWidth}px` },
  });

  const tooltipElement = visible ? (
    <Root ref={setTooltipRef} {...getTooltipProps(modifiedTooltipProps)}>
      {content}
    </Root>
  ) : null;

  return (
    <Container>
      <Children ref={setTriggerRef} style={{ ...containerStyles }}>
        {children}
      </Children>
      {tooltipElement && ReactDOM.createPortal(tooltipElement, document.getElementById("portal-root")!)}
    </Container>
  );
};

export default Tooltip;

const Root = styled.div`
  display: flex;
  background: ${({ theme }) => `${theme.colors.bgSecondary}`};
  z-index: 3;
  padding: 8px 0;
  border-radius: 10px;
  width: fit-content;
  min-width: fit-content;
  box-shadow:
    0 4px 20px 0 rgba(0, 0, 0, 0.5),
    1px 1px 2px 0 rgba(0, 0, 0, 0.25);
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Children = styled.div`
  cursor: pointer;
  position: relative;
`;
