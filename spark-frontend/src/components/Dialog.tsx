import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import RcDialog, { DialogProps } from "rc-dialog";

type Props = DialogProps & {
  onCloseDialog: () => void;
};

export const Dialog: React.FC<Props> = observer(({ onCloseDialog, children, ...rest }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (initialized && dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onCloseDialog();
      }
    };

    if (!initialized) {
      setTimeout(() => setInitialized(true), 300); // Добавляем задержку перед добавлением обработчика
    } else {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onCloseDialog, initialized]);

  return (
    <RcDialog animation="zoom" closeIcon={rest.onClose ? rest.closeIcon : <div />} maskAnimation="fade" {...rest}>
      <div ref={dialogRef}>{children}</div>
    </RcDialog>
  );
});
