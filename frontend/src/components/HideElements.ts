import styled from "@emotion/styled";

export const Mobile = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (min-width: 880px) {
    display: none;
  }
`;

export const Desktop = styled.div`
  display: none;
  width: 100%;
  @media (min-width: 880px) {
    display: flex;
    flex-direction: column;
  }
`;
