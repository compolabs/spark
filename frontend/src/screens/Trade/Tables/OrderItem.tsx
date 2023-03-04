import styled from "@emotion/styled";
import React from "react";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import SizedBox from "@components/SizedBox";
import { ReactComponent as CloseIcon } from "@src/assets/icons/close.svg";
import CircularProgressbar from "@src/components/CircularProgressbar";

interface IProps {
  id: string;
  time: string;
  pair: string;
  price: string;
  amount: string;
  fullFillPercent: number;
  total: string;
  status: string;
  onCancel?: () => void;
  onClick?: () => void;
}

const Root = styled.div`
  display: flex;
  align-items: center;
  margin: 4px 0;
`;

const Order: React.FC<IProps> = ({
  time,
  pair,
  price,
  amount,
  fullFillPercent,
  status,
  onCancel,
  onClick,
}) => {
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
            percent={fullFillPercent}
            red={status === "Canceled"}
          />
          <SizedBox width={10} />
          <Column>
            <Text fitContent>{pair}</Text>
            <Text type="secondary" size="small">
              {time}
            </Text>
          </Column>
        </Row>
        <Column>
          <Text nowrap textAlign="end" type="secondary" size="small">
            Price: {price}
          </Text>
          <Text nowrap textAlign="end" type="secondary" size="small">
            Amount: {amount}
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
