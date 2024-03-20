import { CSSProperties } from "react";
import styled from "@emotion/styled";

type FlexProps = {
  column?: boolean;
  center?: "x" | "y" | true;
  alignItems?: CSSProperties["alignItems"];
  alignSelf?: CSSProperties["alignSelf"];
  justifyContent?: CSSProperties["justifyContent"];
  justifySelf?: CSSProperties["justifySelf"];
  grow?: CSSProperties["flexGrow"];
  shrink?: CSSProperties["flexShrink"];
  wrap?: CSSProperties["flexWrap"];
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  margin?: CSSProperties["margin"];
  padding?: CSSProperties["padding"];
  gap?: CSSProperties["gap"];
};

const setProp = <T extends Record<string, any>>(prop: keyof T, cssProp: string) => {
  return (props: T) => prop in props && `${cssProp}: ${props[prop]};`;
};

export const SmartFlex = styled.div<FlexProps>`
  display: flex;
  flex-direction: ${({ column }) => (column ? "column" : "row")};

  ${({ column, center }) => {
    const centerX = center === "x" || center === true;
    const centerY = center === "y" || center === true;

    if (column) {
      return `
        align-items: ${centerX ? "center" : "normal"};
        justify-content:  ${centerY ? "center" : "normal"};
      `;
    }

    return `
      align-items: ${centerY ? "center" : "normal"};
      justify-content:  ${centerX ? "center" : "normal"};
    `;
  }};

  ${setProp("alignItems", "align-items")}
  ${setProp("alignSelf", "align-self")}
  ${setProp("justifyContent", "justify-content")}
  ${setProp("justifySelf", "justify-self")}
  ${setProp("grow", "flex-grow")}
  ${setProp("shrink", "flex-shrink")}
  ${setProp("wrap", "flex-wrap")}
  ${setProp("width", "width")}
  ${setProp("height", "height")}
  ${setProp("gap", "gap")}
  ${setProp("margin", "margin")}
  ${setProp("padding", "padding")}
`;
