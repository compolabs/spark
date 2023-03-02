import styled from "@emotion/styled";
import React from "react";
import { useTheme } from "@emotion/react";

interface IProps {
  value: boolean;
  onChange: () => void;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;

  .switch {
    position: relative;
    display: inline-block;
    width: 76px;
    height: 40px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.switch.background};

    :disabled {
      background-color: ${({ theme }) => theme.colors.neutral4};
    }

    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  .slider:before {
    position: absolute;
    content: "";
    width: 36px;
    height: 36px;
    left: 2px;
    bottom: 2px;

    background-color: ${({ theme }) => theme.colors.switch.circleColor};
    box-shadow: 0px 2px 4px rgba(54, 56, 112, 0.12);

    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: ${({ theme }) => theme.colors.switch.background};
  }

  input:focus + .slider {
    box-shadow: 0 0 1px ${({ theme }) => theme.colors.switch.background};
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(36px);
    -ms-transform: translateX(36px);
    transform: translateX(36px);
  }

  .slider.round {
    border-radius: 40px;

    box-shadow: 0 2px 4px rgba(54, 56, 112, 0.12);
  }

  .slider.round:before {
    content: ${({ theme }) => theme.images.icons.sun};
    border-radius: 32px;
  }
`;

const Switch: React.FC<IProps> = ({ value, onChange }) => {
  const theme = useTheme();
  return (
    <Root>
      <label className="switch">
        <input type="checkbox" checked={value} onChange={onChange} />
        <span className="slider round">
          <img
            alt="sun"
            style={{ zIndex: 10, position: "absolute", top: 12, left: 50 }}
            src={theme.images.icons.moon}
          />
          <img
            alt="moon"
            style={{ zIndex: 10, position: "absolute", top: 12, left: 12 }}
            src={theme.images.icons.sun}
          />
        </span>
      </label>
    </Root>
  );
};
export default Switch;
