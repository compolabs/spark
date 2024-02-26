import React, { useCallback, useRef } from "react";
import { observer } from "mobx-react-lite";
import RcDialog, { DialogProps } from "rc-dialog";

import { useOnClickOutside } from "@src/hooks/useOnClickOutside";

export const Dialog: React.FC<DialogProps> = observer(({ children, ...rest }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const handleCloseDialog = useCallback(() => {
    rest.onClose !== undefined && rest.onClose(null as any);
  }, [rest.onClose]);
  useOnClickOutside(dialogRef, handleCloseDialog);
  return (
    <RcDialog animation="zoom" closeIcon={rest.onClose ? rest.closeIcon : <div />} maskAnimation="fade" {...rest}>
      <div ref={dialogRef}>{children}</div>
    </RcDialog>
  );
});
