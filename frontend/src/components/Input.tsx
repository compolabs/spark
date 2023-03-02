import styled from "@emotion/styled";
import React, { ChangeEvent, useState } from "react";
import Text from "@components/Text";

interface IProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange" | "prefix"
  > {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  suffix?: JSX.Element;
  prefix?: JSX.Element;
  suffixCondition?: boolean;
  error?: boolean;
  errorText?: string;
  description?: string;
}

const Root = styled.div<{ focused?: boolean; error?: boolean }>`
  width: 100%;
  background: ${({ focused }) => (focused ? "#fffff" : "#f1f2fe")};

  align-items: center;
  border-radius: 12px;
  justify-content: space-between;
  display: flex;
  padding: 12px;
  font-size: 16px;
  line-height: 24px;
  box-sizing: border-box;
  height: 48px;

  input {
    padding: 0;
    width: 100%;
    color: ${({ focused, theme }) =>
      focused ? `${theme.colors.text}` : `${theme.colors.text}`};
    outline: none;
    border: none;
    background-color: transparent;

    ::placeholder {
      color: ${({ theme }) => `${theme.colors.text}`};
    }
  }
`;

const Input: React.FC<IProps> = ({
  value,
  onChange,
  prefix,
  suffix,
  suffixCondition,
  placeholder,
  error,
  errorText,
  description,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <>
      <Root focused={focused} error={error} {...rest}>
        {prefix && prefix}
        <input
          onChange={onChange}
          value={value}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {suffixCondition || (suffix != null && suffix)}
      </Root>
      {description && (
        <Text size="small" type="secondary" style={{ paddingTop: 4 }}>
          {description}
        </Text>
      )}
    </>
  );
};
export default Input;
