import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import BigNumberInput from "@components/BigNumberInput";
import AmountInput from "@components/AmountInput";
import _ from "lodash";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";

interface IProps {
  assetId: string;
  setAssetId?: (assetId: string) => void;

  onMaxClick?: () => void;
  balance?: string;

  disabled?: boolean;

  error: string | null;

  decimals: number;

  amount: BN;
  setAmount?: (amount: BN) => void;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;

  & > :first-of-type {
    margin-bottom: 8px;
  }
`;

const InputContainer = styled.div<{
  focused?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
}>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 32px;
  font-weight: 600;
  font-size: 20px;
  line-height: 32px;
  width: 100%;
  cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};

  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
  }
`;

const MaxButton = styled.div`
  font-style: normal;
  font-weight: 700;
  font-size: 13px;
  line-height: 24px;
  padding: 4px 16px;
  border-radius: 4px;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.button.secondaryBackground};
  color: ${({ theme }) => theme.colors.button.secondaryColor};
`;
const TokenInput: React.FC<IProps> = (props) => {
  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(props.amount);

  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  const handleChangeAmount = (v: BN) => {
    if (props.disabled) return;
    setAmount(v);
    debounce(v);
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
      <InputContainer focused={focused} readOnly={!props.setAmount}>
        <BigNumberInput
          renderInput={(props, ref) => (
            <AmountInput
              {...props}
              onFocus={(e) => {
                props.onFocus && props.onFocus(e);
                !props.readOnly && setFocused(true);
              }}
              onBlur={(e) => {
                props.onBlur && props.onBlur(e);
                setFocused(false);
              }}
              ref={ref}
            />
          )}
          autofocus={focused}
          decimals={props.decimals}
          value={amount}
          onChange={handleChangeAmount}
          placeholder="0.00"
          readOnly={!props.setAmount}
        />
        {props.onMaxClick && (
          <MaxButton
            onClick={() => {
              if (props.disabled) return;
              setFocused(true);
              props.onMaxClick && props.onMaxClick();
            }}
          >
            MAX
          </MaxButton>
        )}
      </InputContainer>
      <SizedBox height={2} />
      {/*{props.error==null}*/}
      {props.error != null ? (
        <Text fitContent size="tiny" type="error">
          {props.error}
        </Text>
      ) : (
        props.balance && (
          <Text fitContent size="tiny" type="secondary">
            {`${props.balance} available`}
          </Text>
        )
      )}
    </Root>
  );
};
export default observer(TokenInput);
