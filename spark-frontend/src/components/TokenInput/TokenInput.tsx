import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import _ from "lodash";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import SizedBox from "@components/SizedBox";
import { FormattedInput } from "./FormattedInput";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { useTheme } from "@emotion/react";

interface IProps {
  assetId: string;
  setAssetId?: (assetId: string) => void;
  decimals: number;
  label?: string;
  amount: BN;
  setAmount?: (amount: BN) => void;
  errorMessage?: string;
  error?: boolean;
  disabled?: boolean;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const InputContainer = styled.div<{
  focused?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  error?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px;
  height: 30px;
  width: 100%;
  cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};

  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
  }

  background: ${({ disabled, theme }) => (disabled ? theme.colors.gray2 : theme.colors.gray5)};

  border-radius: 4px;
  border: 1px solid
    ${({ error, focused, disabled, theme }) =>
      (() => {
        if (disabled) return theme.colors.gray2;
        if (error) return theme.colors.error;
        if (focused) return theme.colors.gray1;
        return theme.colors.gray5;
      })()};
`;

const Symbol = styled.div<{ disabled?: boolean }>`
  display: flex;
  padding: 4px 8px;
  justify-content: center;
  align-items: center;

  color: ${({ theme }) => theme.colors.gray2};
  background: ${({ disabled, theme }) => (disabled ? theme.colors.gray2 : theme.colors.gray4)};
  text-align: center;
  ${TEXT_TYPES_MAP[TEXT_TYPES.LABEL]}
  border-radius: 4px;
`;
const TokenInput: React.FC<IProps> = (props) => {
  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(props.amount);
  const theme = useTheme();
  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  const handleChangeAmount = (e: any) => {
    const value = BN.parseUnits(e.target.value, props.decimals);
    setAmount(value);
    debounce(value);
  };
  //eslint-disable-next-line react-hooks/exhaustive-deps
  const debounce = useCallback(
    _.debounce((value: BN) => {
      props.setAmount && props.setAmount(value);
    }, 500),
    []
  );

  return (
    <Root>
      {props.label != null && (
        <>
          <Text type={TEXT_TYPES.LABEL} color={theme.colors.gray2}>
            {props.label}
          </Text>
          <SizedBox height={4} />
        </>
      )}
      <InputContainer focused={focused} readOnly={!props.setAmount} error={props.error} disabled={props.disabled}>
        <FormattedInput
          placeholder="0.00"
          decimals={props.decimals}
          formatSeparator=","
          value={BN.formatUnits(amount, props.decimals).toString()}
          onChange={handleChangeAmount}
          autoFocus={focused}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          readOnly={!props.setAmount}
          disabled={props.disabled}
        />
        <Symbol disabled={props.disabled}>{TOKENS_BY_ASSET_ID[props.assetId].symbol}</Symbol>
      </InputContainer>
      {props.error && (
        <>
          <SizedBox width={4} />
          <Text color={theme.colors.error} type={TEXT_TYPES.BODY_SMALL}>
            {props.errorMessage}
          </Text>
        </>
      )}
    </Root>
  );
};
export default observer(TokenInput);
