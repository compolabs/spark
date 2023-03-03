import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import SizedBox from "@components/SizedBox";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";
import { ReactComponent as CloseIcon } from "@src/assets/icons/close.svg";
import CircularProgressbar from "@src/components/CircularProgressbar";
import { IOrder } from "../TradeVm";
import dayjs from "dayjs";

interface IProps extends IOrder {
  onCancel?: () => void;
  onClick?: () => void;
}

const Root = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2px;
`;

const Order: React.FC<IProps> = ({
  fulfilled0,
  amount1,
  amount0,
  token1,
  token0,
  status,
  onCancel,
  onClick,
}) => {
  const t0 = TOKENS_BY_ASSET_ID[token0];
  const t1 = TOKENS_BY_ASSET_ID[token1];
  const am0 = BN.formatUnits(amount0, t0.decimals);
  const am1 = BN.formatUnits(amount1, t1.decimals);
  const percent = fulfilled0.times(100).div(amount0);
  const price = am1.div(am0);
  return (
    <Root>
      <Row
        alignItems="center"
        justifyContent="space-between"
        onClick={onClick}
        style={{ cursor: "pointer" }}
      >
        <Row alignItems="center">
          <CircularProgressbar
            percent={percent.toNumber()}
            red={status === "canceled"}
          />
          <SizedBox width={10} />
          <Column>
            <Text fitContent>{`${t0.symbol}/${t1.symbol}`}</Text>
            <Text type="secondary" size="small">
              {dayjs().format("DD-MMM MM:HH")}
            </Text>
          </Column>
        </Row>
        <Column>
          <Text nowrap textAlign="end" type="secondary" size="small">
            Price: {price.toFormat(2)} {t1.symbol}
          </Text>
          <Text nowrap textAlign="end" type="secondary" size="small">
            Amount: {price.toFormat(2)} {t1.symbol}
          </Text>
        </Column>
      </Row>
      {onCancel && (
        <CloseIcon
          onClick={onCancel}
          style={{ cursor: "pointer", height: 16, width: 16, marginLeft: 8 }}
        />
      )}
    </Root>
  );
};
export default Order;
