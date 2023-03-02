import React from "react";
import { observer } from "mobx-react-lite";
import useWindowSize from "@src/hooks/useWindowSize";
import OrderDesktop from "@screens/Trade/Order/OrderDesktop";
import OrderMobile from "@screens/Trade/Order/OrderMobile";

interface IProps {}

const Order: React.FC<IProps> = () => {
  const { width } = useWindowSize();
  return width && width >= 880 ? <OrderDesktop /> : <OrderMobile />;
};
export default observer(Order);
