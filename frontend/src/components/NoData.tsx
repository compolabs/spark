import React from "react";
import Img from "@components/Img";
import notFound from "@src/assets/notFound.svg";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { Column } from "./Flex";

interface IProps {
  text: string;
}

const NoData: React.FC<IProps> = ({ text }) => {
  return (
    <Column justifyContent="center" alignItems="center" crossAxisSize="max">
      <Img style={{ width: 100, height: 100 }} src={notFound} alt="no-data" />
      <SizedBox height={12} />
      <Text fitContent style={{ marginBottom: 24 }}>
        {text}
      </Text>
    </Column>
  );
};
export default NoData;
