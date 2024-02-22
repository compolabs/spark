import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import RcDialog, { DialogProps } from "rc-dialog";

type Props = DialogProps & {
  onClose: () => void;
};

export const Dialog: React.FC<Props> = observer(({ onClose, children, ...rest }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (initialized && dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
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
  }, [onClose, initialized]);

  return (
    <RcDialog {...rest}>
      <div ref={dialogRef}>{children}</div>
    </RcDialog>
  );
});
