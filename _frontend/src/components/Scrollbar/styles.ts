import styled from "@emotion/styled";

export const ScrollbarRoot = styled.span`
  .ps__rail-x,
  .ps__rail-y {
    z-index: 999;

    & > .ps__thumb-y {
      background-color: #f1f2fe;
      width: 6px !important;

      &:hover {
        background-color: #f1f2fe;
      }
    }

    & > .ps__thumb-x {
      background-color: #f1f2fe;
      height: 6px !important;

      &:hover {
        background-color: #f1f2fe;
      }
    }

    &:hover,
    &:focus,
    &.ps--clicking {
      background-color: transparent !important;

      & > .ps__thumb-y,
      & > .ps__thumb-x {
        background-color: #f1f2fe;
      }
    }
  }
`;
