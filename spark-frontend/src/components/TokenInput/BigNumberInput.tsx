import * as React from "react";

import BN from "@src/utils/BN";

export interface IBigNumberInputProps {
  className?: string;
  decimals: number;
  value: BN;
  onChange: (value: BN) => void;
  renderInput?: (
    props: React.HTMLProps<HTMLInputElement>,
    ref: React.RefObject<HTMLInputElement>
  ) => React.ReactElement;
  autofocus?: boolean;
  placeholder?: string;
  max?: string;
  min?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const BigNumberInput: React.FC<IBigNumberInputProps> = ({
  decimals,
  value,
  onChange,
  renderInput,
  autofocus,
  placeholder = "0.00",
  max,
  min,
  disabled,
  readOnly,
  ...rest
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [inputValue, _setInputValue] = React.useState<string>("");

  const setInputValue = (value: string): void => {
    if (!inputRef.current) {
      return;
    }

    // const caret = inputRef.current.selectionStart;
    _setInputValue(value);

    // window.requestAnimationFrame(() => {
    //   inputRef.current && inputRef.current.setSelectionRange(caret, caret);
    // });
  };

  // update current value
  React.useEffect(() => {
    if (!value) {
      setInputValue("");
    } else {
      const parseInputValue = BN.parseUnits(inputValue || "0", decimals);

      if (!parseInputValue || !parseInputValue.eq(value)) {
        setInputValue(
          BN.formatUnits(value, decimals).toSignificant(6).toString()
        );
      }
    }
  }, [value, decimals, inputValue]);

  React.useEffect(() => {
    if (autofocus && inputRef.current) {
      inputRef.current.focus();
    }
    // eslint-disable-next-line
  }, [autofocus, inputRef.current]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.currentTarget;

    // Replace comma to the dot
    value = value.replace(",", ".");

    // Replace leading zeros
    if (/^0+[^.]/.test(value)) {
      value = value.replace(/^0+/, "");
    }

    // Limit the number of decimal places to token decimals
    if (value && !new RegExp(`^\\d+(.\\d{0,${decimals}})?$`).test(value)) {
      return;
    }

    if (value === "") {
      onChange(BN.ZERO);
      setInputValue(value);
      return;
    }

    const newValue = BN.parseUnits(value, decimals);
    const invalidValue =
      newValue.isNaN() ||
      (min && newValue.lt(min)) ||
      (max && newValue.gt(max));

    if (invalidValue) {
      return;
    }

    setInputValue(value);
    onChange(newValue);
  };

  const inputProps = {
    ...rest,
    placeholder,
    onChange: handleChange,
    type: "text",
    value: inputValue,
    readOnly,
    disabled,
  };

  return renderInput ? (
    renderInput({ ...inputProps }, inputRef)
  ) : (
    <input {...inputProps} ref={inputRef} />
  );
};

export default BigNumberInput;
