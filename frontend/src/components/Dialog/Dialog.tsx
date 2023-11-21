import React from "react";
import RcDialog from "rc-dialog";
import "rc-dialog/assets/index.css";
import "./styles.css";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";
import { ReactComponent as CloseIcon } from "@src/assets/icons/close.svg";
import styled from "@emotion/styled";

interface IProps extends IDialogPropTypes {}

const StyledCloseIcon = styled(CloseIcon)`
	path {
		transition: 0.4s;
		stroke: ${({ theme }) => theme.colors.textPrimary};
	}
`;

const Dialog: React.FC<IProps> = ({ children, ...rest }) => (
	<RcDialog
		closeIcon={rest.onClose != null ? <StyledCloseIcon /> : <></>}
		animation="zoom"
		maskAnimation="fade"
		{...rest}
	>
		{children}
	</RcDialog>
);
export default Dialog;
