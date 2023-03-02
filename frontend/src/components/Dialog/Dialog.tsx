import React from "react";
import RcDialog from "rc-dialog";
import "rc-dialog/assets/index.css";
import "./styles.css";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";
import { ReactComponent as CloseIcon } from "@src/assets/icons/close.svg";

interface IProps extends IDialogPropTypes {}

const Dialog: React.FC<IProps> = ({ children, ...rest }) => {
  return (
    <RcDialog
      closeIcon={<CloseIcon style={{ marginTop: 8 }} />}
      animation="zoom"
      maskAnimation="fade"
      {...rest}
    >
      {children}
    </RcDialog>
  );
};
export default Dialog;
