import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import BN from "@src/utils/BN";
import BigNumberInput from "@components/BigNumberInput";
import AmountInput from "@components/AmountInput";
import _ from "lodash";
import Text from "@components/Text";

interface IProps {
  assetId: string;
  setAssetId?: (assetId: string) => void;

  decimals: number;
  description?: string;

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
  padding: 16px;
  height: 32px;
  width: 100%;
  position: relative;
  cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};

  box-sizing: border-box;

  input {
    cursor: ${({ readOnly }) => (readOnly ? "not-allowed" : "unset")};
  }

  background: #323846;
  border: 1px solid #3a4050;
  border-radius: 4px;

  //todo add border
`;
const TokenInput: React.FC<IProps> = (props) => {
  const [focused, setFocused] = useState(false);
  const [amount, setAmount] = useState<BN>(props.amount);

  useEffect(() => {
    props.amount && setAmount(props.amount);
  }, [props.amount]);

  const handleChangeAmount = (v: BN) => {
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
        {props.description != null && (
          <Text
            style={{ whiteSpace: "nowrap" }}
            type="secondary"
            size="small"
            fitContent
          >
            {props.description}
          </Text>
        )}
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
      </InputContainer>
    </Root>
  );
};
export default observer(TokenInput);
