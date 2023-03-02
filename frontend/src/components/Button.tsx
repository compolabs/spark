import styled from "@emotion/styled";

type TButtonType = "primary" | "secondary" | "danger" | "green";

const Button = styled.button<{
  kind?: TButtonType;
  fixed?: boolean;
}>`
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;

  border: none;
  border-radius: 4px;
  box-shadow: none;
  font-style: normal;

  width: ${({ fixed }) => (fixed ? "100%" : "fit-content")};
  padding: 8px 16px;

  ${({ kind, theme }) =>
    (() => {
      switch (kind) {
        case "primary":
          return `background: ${theme.colors.button.primaryBackground}; color:${theme.colors.button.primaryColor}; border: 1px solid ${theme.colors.button.primaryColor}`;
        case "secondary":
          return `background: ${theme.colors.button.secondaryBackground}; color:${theme.colors.button.secondaryColor}; border: 1px solid ${theme.colors.button.secondaryBackground}`;
        case "danger":
          return `background: #E5494D; color:${theme.colors.button.primaryColor}; border: 1px solid #E5494D;`;
        case "green":
          return `background: #25B05B; color:${theme.colors.button.primaryColor}; border: 1px solid #25B05B;`;
        default:
          return `background: ${theme.colors.button.primaryBackground}; color:${theme.colors.button.primaryColor}; border: 1px solid ${theme.colors.button.primaryColor}`;
      }
    })()}

  cursor: pointer;

  :hover {
    background: ${({ kind, theme }) =>
      (() => {
        switch (kind) {
          case "primary":
            return theme.colors.button.primaryBackgroundHover;
          case "secondary":
            return theme.colors.button.secondaryBackgroundHover;
          case "danger":
            return "#E5494D";
          case "green":
            return "#25B05B";
          default:
            return theme.colors.button.primaryBackgroundHover;
        }
      })()};
  }

  :disabled {
    border: 1px solid ${({ theme }) => theme.colors.button.backgroundDisabled};
    background: ${({ theme }) => theme.colors.button.backgroundDisabled};
    color: ${({ theme }) => theme.colors.neutral4};
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Button;
