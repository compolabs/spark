import styled from "@emotion/styled";

type TTextType = "primary" | "secondary" | "error" | "green";
type TTextSize = "tiny" | "small" | "medium" | "large" | "big";
type TTextAlign = "center" | "left" | "right" | "justify" | "end";

const Text = styled.p<{
  type?: TTextType;
  weight?: 400 | 500;
  size?: TTextSize;
  fitContent?: boolean;
  nowrap?: boolean;
  crossed?: boolean;
  ellipsis?: number;
  textAlign?: TTextAlign;
}>`
  margin: 0;
  width: ${({ fitContent }) => (fitContent ? "fit-content" : "100%")};
  font-weight: ${({ weight }) => weight ?? 400};
  white-space: ${({ nowrap }) => (nowrap ? "nowrap" : "unset")};
  text-decoration: ${({ crossed }) => (crossed ? "line-through" : "unset")};
  text-align: ${({ textAlign }) => textAlign ?? "default"};
  ${({ type, theme }) =>
    (() => {
      switch (type) {
        case "primary":
          return `color: ${theme.colors?.text};`;
        case "secondary":
          return `color: ${theme.colors?.neutral4};`;
        case "error":
          return `color: ${theme.colors?.secondary1};`;
        case "green":
          return `color: #25B05B;`;
        default:
          return `color: ${theme.colors?.text};`;
      }
    })()}
  ${({ ellipsis }) =>
    ellipsis != null &&
    `max-width: ${ellipsis}px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`};
  ${({ size }) =>
    (() => {
      switch (size) {
        case "tiny":
          return "font-size: 10px; line-height: 12px;";
        case "small":
          return "font-size: 12px; line-height: 18px;";
        case "medium":
          return "font-size: 18px; line-height: 24px;";
        case "big":
          return "font-size: 26px; line-height: 32px;";
        case "large":
          return "font-size: 64px; line-height: 64px;";
        default:
          return "font-size: 15px; line-height: 24px;";
      }
    })()}
`;

export default Text;
