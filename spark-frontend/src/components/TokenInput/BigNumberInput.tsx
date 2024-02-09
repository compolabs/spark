import React, { useEffect, useRef, useState } from "react";
import { Nullable } from "tsdef";

import { DEFAULT_DECIMALS } from "@src/constants";
import BN from "@src/utils/BN";

type HTMLInputProps = React.ClassAttributes<HTMLInputElement> & React.InputHTMLAttributes<HTMLInputElement>;

export type RenderInput = (props: HTMLInputProps, ref: React.RefObject<HTMLInputElement>) => React.ReactElement;

export interface BigNumberInputProps {
  className?: string;
  decimals?: number;
  value?: Nullable<BN>;
  onChange: (value: BN) => void;
  customInput?: React.FC<any>;
  renderInput?: RenderInput;
  autofocus?: boolean;
  placeholder?: string;
  max?: string;
  min?: string;
  disabled?: boolean;
  displayDecimals?: number;
}

export const BigNumberInput: React.FC<BigNumberInputProps> = ({
  decimals = DEFAULT_DECIMALS,
  displayDecimals: _displayDecimals,
  value,
  autofocus,
  max,
  min,
  customInput,
  renderInput,
  onChange,
  ...props
}) => {
  const displayDecimals = _displayDecimals ?? decimals;

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  // update current value
  useEffect(() => {
    if (inputValue === "-") {
      return;
    }

    if (!value) {
      setInputValue("");
    } else {
      const parseInputValue = BN.parseUnits(inputValue || BN.ZERO, decimals);

      if (!parseInputValue.eq(value)) {
        setInputValue(BN.formatUnits(value, decimals).toSignificant(displayDecimals));
      }
    }
  }, [value, decimals, inputValue, displayDecimals]);

  useEffect(() => {
    if (autofocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autofocus]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.currentTarget;

    // Replace comma with dot
    value = value.replace(",", ".");

    // Replace leading zeros
    if (/^0+[^.]/.test(value)) {
      value = value.replace(/^0+/, "");
      if (value === "") {
        value = "0";
      }
    }

    // Replace "." with "0." and ".0" with "0.0"
    if (value.startsWith(".")) {
      value = `0${value}`;
    }

    // Prohibit entering 2 or more dots. Need for ios safari
    if (/(.+)?\.(.+)?\.(.+)?/.test(value)) {
      return;
    }

    // Limit the number of decimal places to token decimals
    if (
      value &&
      !new RegExp(`^\\s*-?(\\d+(.\\d{0,${displayDecimals}})?|.\\d{0,${displayDecimals}})\\s*$`).test(value)
    ) {
      return;
    }

    if (min && new BN(min).lt(0) && value === "-") {
      setInputValue(value);
      return;
    }

    const bn = BN.parseUnits(value || BN.ZERO, decimals);
    const bnIsInvalid = bn.isNaN() || (min && bn.lt(min)) || (max && bn.gt(max));

    if (bnIsInvalid) {
      return;
    }

    setInputValue(value);
    onChange(bn);
  };

  const inputProps: HTMLInputProps = {
    onChange: handleChange,
    type: "text",
    value: inputValue,
    ...props,
  };

  if (customInput) {
    const Input = customInput;

    return <Input {...inputProps} ref={inputRef} />;
  }

  if (renderInput) {
    return renderInput(inputProps, inputRef);
  }

  return <input {...inputProps} ref={inputRef} />;
};
