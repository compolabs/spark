import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Text from "@components/Text";
import error from "@src/assets/icons/error.svg";
import warning from "@src/assets/icons/warning.svg";
import SizedBox from "@components/SizedBox";
import { Column } from "./Flex";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  type: "warning" | "info" | "error";
  text: string | JSX.Element;
}

const Root = styled.div<{ type: "warning" | "info" | "error" }>`
  display: flex;
  flex-direction: row;
  ${({ type, theme }) =>
    (() => {
      switch (type) {
        case "warning":
          return `background: ${theme.colors.red200};`;
        case "info":
          return `background: ${theme.colors.blue100};`;
        case "error":
          return `background: ${theme.colors.blue100};`;
        default:
          return `background: ${theme.colors.blue100};`;
      }
    })()}
  border-radius: 4px;
  padding: 18px;
  justify-content: flex-start;

  a {
    color: #00b493;
    text-decoration: underline;
  }
`;

const Notification: React.FC<IProps> = ({ text, type, ...rest }) => {
  const getIcon = () => {
    switch (type) {
      case "error":
        return error;
      case "info":
        return warning;
      case "warning":
        return warning;
    }
  };
  return (
    <Root type={type} {...rest}>
      <Column>
        <img src={getIcon()} alt="info" />
      </Column>
      <SizedBox width={10} />
      <Column justifyContent="center" mainAxisSize="stretch">
        {typeof text === "string" ? (
          <Text style={{ height: "100%" }} size="small">
            {text}
          </Text>
        ) : (
          text
        )}
      </Column>
    </Root>
  );
};
export default Notification;
