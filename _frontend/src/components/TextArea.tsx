import styled from "@emotion/styled";
import React from "react";

interface IProps
  extends Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange" | "prefix"
  > {
  value: string;
  onChange: (e: string) => void;
  error?: boolean;
}

const Root = styled.textarea<{ error?: boolean }>`
  background: transparent;
  resize: none;
  font-weight: 600;
  font-size: 20px;
  line-height: 32px;

  letter-spacing: -0.02em;
  border-radius: 4px;
  outline: none;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid
    ${({ theme, error }) =>
      error ? theme.colors.red100 : theme.colors.textArea.borderColor};
  width: calc(100% - 6px);
  min-height: 160px;

  .scroll::-webkit-scrollbar {
    display: none;
  }
`;

const TextArea: React.FC<IProps> = ({ onChange, value, error }) => {
  return (
    <Root
      error={error}
      onChange={(e) => onChange(e.target.value)}
      value={value}
    />
  );
};
export default TextArea;
