import RCSlider from "rc-slider";
import React from "react";
import { SliderProps } from "rc-slider/lib/Slider";
import styled from "@emotion/styled";

const Root = styled.div`
  .rc-slider-dot {
    border: 3px solid #495060;
    background-color: #495060;
  }
  .rc-slider-mark-text {
    display: none;
  }
`;

const Slider: React.FC<SliderProps> = (props) => {
  return (
    <Root>
      <RCSlider
        dotStyle={{ border: "3px solid #495060", backgroundColor: "#495060" }}
        trackStyle={{ backgroundColor: "#5A81EA" }}
        activeDotStyle={{ backgroundColor: "#5A81EA", borderColor: "#5A81EA" }}
        railStyle={{ backgroundColor: "#495060" }}
        handleStyle={{
          border: "3px solid #7075E9",
          boxShadow: "0px 4px 16px rgba(112, 117, 233, 0.32)",
          width: 16,
          height: 16,
          marginTop: -6,
        }}
        {...props}
      />
    </Root>
  );
};
export default Slider;
