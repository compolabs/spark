import React from "react";
import styled from "@emotion/styled";

import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import search from "@src/assets/icons/search.svg";

import Input from "./Input";

interface IProps {
  value: string;
  onChange: (v: string) => void;
}

const Wrap = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.borderSecondary};
  background: ${({ theme }) => theme.colors.bgPrimary};
  height: 32px;
  padding: 4px 8px;
  box-sizing: border-box;

  input {
    ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
  }
`;

const SearchInput: React.FC<IProps> = ({ value, onChange }) => {
  return (
    <Wrap>
      <img alt="search" src={search} />
      <Input placeholder="Search by name..." value={value} onChange={(e) => onChange(e.target.value)} />
    </Wrap>
  );
};
export default SearchInput;
