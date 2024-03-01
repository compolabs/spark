import React from "react";

import { NETWORK } from "@src/blockchain/types";
import { getExplorerLinkByAddress, getExplorerLinkByHash } from "@src/utils/getExplorerLink";

import { SmartFlex } from "./SmartFlex";
import Text, { TEXT_TYPES } from "./Text";

interface IProps {
  text: string;
  linkText?: string;
  hash?: string;
  address?: string;
  networkType?: NETWORK;
}

// todo: Использовать везде где происходит notificationStore.toast
const Toast: React.FC<IProps> = ({ text, linkText = "Open In Explorer", hash, address, networkType }) => {
  const link =
    hash && networkType
      ? getExplorerLinkByHash(hash, networkType)
      : address && networkType
        ? getExplorerLinkByAddress(address, networkType!)
        : undefined;

  return (
    <SmartFlex gap="8px" column>
      <span>{text}</span>
      {link && (
        <a href={link} rel="noreferrer noopener" target="_blank">
          <Text type={TEXT_TYPES.BODY} secondary>
            {linkText}
          </Text>
        </a>
      )}
    </SmartFlex>
  );
};

export default Toast;
