import React from "react";
import { BottomSheet, BottomSheetProps } from "react-spring-bottom-sheet";
import { Column, Row } from "@components/Flex";
import styled from "@emotion/styled";

interface IProps extends BottomSheetProps {
  onClose: () => void;
}

const Header = styled(Row)`
  box-sizing: border-box;
  padding: 16px;
  border-bottom: 1px solid #3b3b46;
`;
const Body = styled(Column)`
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
`;

const BottomMenu: React.FC<IProps> = ({ children, open, header, onClose }) => (
  <BottomSheet open={open} onDismiss={onClose}>
    {header && <Header>{header}</Header>}
    <Body>{children}</Body>
  </BottomSheet>
);

export default BottomMenu;
