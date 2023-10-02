import styled from "@emotion/styled";

type TokenIconSize = "default" | "small" | "tiny";

const TokenIcon = styled.img<{ size?: TokenIconSize }>`
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  box-sizing: border-box;
  box-shadow: none;
  color: transparent;
  object-fit: cover;
  ${({ size }) =>
    (() => {
      switch (size) {
        case "tiny":
          return "width: 16px; height: 16px;";
        case "small":
          return "width: 40px; height: 40px;";
        default:
          return "width: 56px; height: 56px;";
      }
    })()}
`;

export default TokenIcon;
