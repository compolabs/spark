import styled from "@emotion/styled";
import React from "react";
import { observer } from "mobx-react-lite";
import Wallet from "../Wallet";
import { ROUTES } from "@src/constants";
import isRoutesEquals from "@src/utils/isRoutesEquals";
import Text from "@components/Text";
import { useLocation, useNavigate } from "react-router-dom";
import { Row } from "../Flex";

interface IProps {
  onClose: () => void;
  opened: boolean;
}

const Root = styled.div<{ opened: boolean }>`
  z-index: 100;
  background: ${({ theme }) => `${theme.colors.modal.mask}`};
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  height: calc(100vh - 64px);
  transition: 0.2s;
  overflow: hidden;

  ${({ opened }) => !opened && `height: 0px;`}
`;
const Body = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.mainBackground};
`;

const WalletWrapper = styled.div`
  padding: 16px;
`;

const MenuItem = styled.div<{ selected?: boolean }>`
  display: flex;
  cursor: pointer;
  flex-direction: row;
  box-sizing: border-box;
  padding: 12px 16px;
  border-radius: 4px;
  width: 100%;

  div {
    color: ${({ selected }) => selected && "#3C69FF"};
  }

  &:hover {
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  max-height: 50vh;

  & > * {
    margin-bottom: 8px;
  }
`;
const MobileMenu: React.FC<IProps> = ({ opened, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Trade", link: ROUTES.TRADE, outer: false },
    { name: "Faucet", link: ROUTES.FAUCET, outer: false },
    {
      name: "Docs",
      link: "https://docs.allspark.gg/",
      outer: true,
    },
    {
      name: "Github",
      link: "https://github.com/compolabs/spark",
      outer: true,
    },
    {
      name: "Community",
      link: "https://discord.com/invite/eC97a9U2Pe",
      outer: true,
    },
  ];
  return (
    <Root {...{ opened }}>
      <Body>
        <Container>
          {menuItems.map(({ name, link, outer }) => (
            <MenuItem
              key={name}
              selected={isRoutesEquals(link, location.pathname)}
              onClick={() => {
                outer ? window.open(link, "_self") : navigate(link);
                onClose();
              }}
            >
              <Text>{name}</Text>
            </MenuItem>
          ))}
        </Container>
        <WalletWrapper>
          <Wallet />
        </WalletWrapper>
      </Body>
    </Root>
  );
};
export default observer(MobileMenu);
