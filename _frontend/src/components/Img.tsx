import styled from "@emotion/styled";

const Root = styled.img<{ width?: string; height?: string; radius?: string }>`
  width: ${({ width }) => (width ? width : "24px")};
  height: ${({ height }) => (height ? height : "24px")};
  ${({ radius }) => radius && `border-radius:${radius}`};
`;

export default Root;
