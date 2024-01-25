import React from "react";
import { observer } from "mobx-react-lite";
import RcDialog, { DialogProps } from "rc-dialog";

type Props = DialogProps;

export const Dialog: React.FC<Props> = observer(({ children, ...rest }) => {
	return (
		<RcDialog animation="zoom" closeIcon={rest.onClose ? rest.closeIcon : <div />} maskAnimation="fade" {...rest}>
			{children}
		</RcDialog>
	);
});
