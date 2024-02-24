import React, { useCallback, useRef } from "react";
import { observer } from "mobx-react-lite";
import RcDialog, { DialogProps } from "rc-dialog";

import { useOnClickOutside } from "@src/hooks/useOnClickOutside";

type Props = DialogProps & {
  onCloseDialog: () => void;
};

export const Dialog: React.FC<Props> = observer(({ children, onCloseDialog, ...rest }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const handleCloseDialog = useCallback(() => {
    if (onCloseDialog) {
      onCloseDialog();
    }
  }, [onCloseDialog]);
  useOnClickOutside(dialogRef, handleCloseDialog);
  return (
    <RcDialog animation="zoom" closeIcon={rest.onClose ? rest.closeIcon : <div />} maskAnimation="fade" {...rest}>
      <div ref={dialogRef}>{children}</div>
    </RcDialog>
  );
});
