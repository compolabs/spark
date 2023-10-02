import React, { HTMLAttributes } from "react";
interface IProps extends HTMLAttributes<HTMLDivElement> {
  width?: number;
  height?: number;
}
const SizedBox: React.FunctionComponent<IProps> = ({
  width,
  height,
  style,
  ...rest
}) => (
  <div
    style={{ width, height, display: "flex", flex: "0 0 auto", ...style }}
    {...rest}
  />
);

export default SizedBox;
