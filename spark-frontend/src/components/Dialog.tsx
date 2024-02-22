import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import RcDialog, { DialogProps } from "rc-dialog";

type Props = DialogProps & {
  onClose: () => void;
};

export const Dialog: React.FC<Props> = observer(({ onClose, children, ...rest }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  return (
    <RcDialog {...rest}>
      <div ref={dialogRef}>{children}</div>
    </RcDialog>
  );
});
