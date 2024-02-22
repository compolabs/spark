import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import RcDialog, { DialogProps } from "rc-dialog";

type Props = DialogProps & {
  onCloseDialog: () => void;
};

export const Dialog: React.FC<Props> = observer(({ onCloseDialog, children, ...rest }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onCloseDialog();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onCloseDialog]);

  return (
    <RcDialog animation="zoom" closeIcon={rest.onClose ? rest.closeIcon : <div />} maskAnimation="fade" {...rest}>
      <div ref={dialogRef}>{children}</div>
    </RcDialog>
  );
});
