import React from "react";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

import Text from "@components/Text";
import sparkLogoIcon from "@src/assets/icons/sparkLogoIcon.svg";
import { SmartFlex } from "@src/components/SmartFlex";

interface Props {
  size?: number;
  hideText?: boolean;
  text?: string;
}

const Loader: React.FC<Props> = ({ size = 64, hideText, text = "Loading" }) => {
  return (
    <SmartFlex gap="8px" height="100%" width="100%" center column>
      <LoaderLogoImage alt="loader" height={size} src={sparkLogoIcon} width={size} />
      {!hideText && <Text primary>{text}</Text>}
    </SmartFlex>
  );
};

export default Loader;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoaderLogoImage = styled.img`
  animation: ${rotate} 4s linear infinite;
`;
