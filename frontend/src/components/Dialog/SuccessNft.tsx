import styled from "@emotion/styled";
import React from "react";
import malibu from "@src/assets/icons/malibu.svg";
import frame from "@src/assets/icons/greenFrame.svg";

interface IProps {
  image: string;
}

const Frame = styled.div`
  background-image: url(${malibu});
  background-size: cover;
  background-position: center;
  box-sizing: border-box;
  box-shadow: none;
  color: transparent;
  width: 120px;
  height: 120px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Green = styled.div`
  background-image: url(${frame});
  background-size: cover;
  background-position: center;
  position: absolute;
  width: 120px;
  height: 120px;
  z-index: 3;
`;
const Nft = styled.div<{ image: string }>`
  ${({ image }) =>
    image != null
      ? `background-image: url(${image});`
      : `background: #C6C9F4;`};
  background-size: cover;
  background-position: center;
  position: absolute;
  border-radius: 12px;
  width: 72px;
  height: 72px;
  z-index: 2;
`;
const SuccessNft: React.FC<IProps> = ({ image }) => {
  return (
    <Frame>
      <Nft image={image} />
      <Green />
    </Frame>
  );
};
export default SuccessNft;
