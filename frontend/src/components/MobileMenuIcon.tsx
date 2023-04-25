import styled from "@emotion/styled";
import React from "react";

interface IProps {
  onClick: () => void;
  opened: boolean;
}

const Root = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  height: 48px;

  //.menu-icon {
  //  transform: scale(1.5);
  //}

  .menu-icon {
    position: relative;
    width: 20px;
    height: 18px;
    cursor: pointer;

    .menu-icon__cheeckbox {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      cursor: pointer;
      z-index: 2;
      -webkit-touch-callout: none;
      position: absolute;
      opacity: 0;
    }

    div {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      height: 13px;
    }

    span {
      position: absolute;
      display: block;
      width: 100%;
      height: 1px;
      background: ${({ theme }) => theme.colors.header.mobileMenuIconColor};
      transition: all 0.2s cubic-bezier(0.1, 0.82, 0.76, 0.965);
      flex-shrink: 0;

      &:first-of-type {
        top: 0px;
      }

      &:nth-of-type(2) {
        top: 6px;
      }

      &:last-of-type {
        bottom: 0px;
      }
    }

    &.active,
    .menu-icon__cheeckbox:checked + div {
      span {
        &:first-of-type {
          transform: rotate(45deg);
          top: 6px;
        }

        &:nth-of-type(2) {
          opacity: 0;
        }

        &:last-of-type {
          transform: rotate(-45deg);
          bottom: 6px;
        }
      }
    }
  }
`;

const MobileMenuIcon: React.FC<IProps> = ({ opened, onClick }) => {
  return (
    <Root onClick={onClick}>
      <div className="menu-icon">
        <input
          className="menu-icon__cheeckbox"
          type="checkbox"
          checked={opened}
          onChange={() => null}
        />
        <div>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      {/*</div>*/}
    </Root>
  );
};
export default MobileMenuIcon;
