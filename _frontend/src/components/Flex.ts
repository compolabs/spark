import styled from "@emotion/styled";

export interface IFlexProps {
  justifyContent?:
    | "start"
    | "flex-end"
    | "space-around"
    | "space-between"
    | "center";
  alignItems?:
    | "start"
    | "end"
    | "center"
    | "inherit"
    | "unset"
    | "flex-end"
    | "flex-start"
    | "baseline";
  crossAxisSize?: "min" | "max";
  mainAxisSize?: "fit-content" | "stretch";
}

export const Row = styled.div<IFlexProps>`
  display: flex;
  flex-direction: row;

  justify-content: ${({ justifyContent }) => justifyContent ?? "start"};
  align-items: ${({ alignItems }) => alignItems ?? "start"};
  height: ${({ crossAxisSize }) =>
    crossAxisSize === "max" ? "100%" : "fit-content"};
  width: ${({ mainAxisSize }) =>
    mainAxisSize === "fit-content" ? "fit-content" : "100%"};
`;

export const Column = styled.div<IFlexProps>`
  display: flex;
  flex-direction: column;
  justify-content: ${({ justifyContent }) => justifyContent ?? "start"};
  align-items: ${({ alignItems }) => alignItems ?? "start"};
  width: ${({ crossAxisSize }) =>
    crossAxisSize === "max" ? "100%" : "fit-content"};
  height: ${({ mainAxisSize }) =>
    mainAxisSize === "stretch" ? "100%" : "fit-content"};
`;
