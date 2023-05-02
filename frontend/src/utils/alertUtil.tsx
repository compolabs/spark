import React from "react";
import styled from "@emotion/styled";
import { ReactComponent as ErrorIcon } from "@src/assets/icons/error.svg";
import { ReactComponent as SuccessIcon } from "@src/assets/icons/success.svg";
import { ReactComponent as WarningIcon } from "@src/assets/icons/warning.svg";
import { ReactComponent as InfoIcon } from "@src/assets/icons/information.svg";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import { TNotifyOptions } from "@stores/NotificationStore";
import { TypeOptions } from "react-toastify";
import { Anchor } from "@src/components/Anchor";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Body = styled(Row)`
  padding-right: 48px;
  box-sizing: border-box;
`;

const Link = styled.a`
  margin-top: 12px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;

  p {
    color: #3c69ff;
  }
`;

const getAlert = (
  content: string,
  { type, title, link, linkTitle }: TNotifyOptions
) => {
  if (!type) return null;
  return (
    <Root>
      <Body>
        <Icon type={type} />
        <Column>
          {title && (
            <Text size="medium" className="notifications-text">
              {title}
            </Text>
          )}
          <Text
            size="small"
            type="secondary"
            className="notifications-text"
            weight={500}
            style={{ marginTop: 2, width: "100%", wordBreak: "break-word" }}
          >
            {content}
          </Text>
          {link && (
            <Anchor href={link}>
              <Text type="secondary">{linkTitle || link}</Text>
            </Anchor>
          )}
        </Column>
      </Body>
    </Root>
  );
};

const Icon: React.FunctionComponent<{
  type: TypeOptions;
}> = ({ type }) => {
  let icon = null;
  const Root = styled.div`
    margin-right: 16px;
  `;
  switch (type) {
    case "error":
      icon = <ErrorIcon />;
      break;
    case "success":
      icon = <SuccessIcon />;
      break;
    case "info":
      icon = <InfoIcon />;
      break;
    case "warning":
      icon = <WarningIcon />;
      break;
  }
  return <Root>{icon}</Root>;
};

export default getAlert;
