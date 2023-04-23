import styled from "@emotion/styled";
import React, { useState } from "react";
import { Column, Row } from "@components/Flex";
import MobileMenu from "@components/Header/MobileMenu";
import { observer } from "mobx-react-lite";
import { useLocation, useNavigate } from "react-router-dom";
import isRoutesEquals from "@src/utils/isRoutesEquals";
import Wallet from "../Wallet";
import { ROUTES } from "@src/constants";
import { useTheme } from "@emotion/react";
import Text from "@components/Text";
import MobileMenuIcon from "../MobileMenuIcon";
import EthBalance from "@components/Wallet/EthBalance";
import SizedBox from "@components/SizedBox";

interface IProps {}

const Root = styled(Column)`
  width: 100%;
  background: ${({ theme }) => theme.colors.header.background};
  z-index: 102;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: 56px;
  @media (min-width: 880px) {
    height: 64px;
  }
`;

const TopMenu = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 16px;
  max-width: 1660px;
  z-index: 102;
  box-sizing: border-box;

  .logo {
    height: 30px;
    @media (min-width: 880px) {
      height: 36px;
    }
  }

  .icon {
    cursor: pointer;
  }
`;
const MenuItem = styled(Text)<{ selected?: boolean }>`
  transition: 0.4s;
  font-family: "Roboto", sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 12px;

  color: ${({ selected, theme }) =>
    selected ? theme.colors.primary02 : theme.colors.neutral0};
  :hover {
    opacity: ${({ selected }) => (selected ? 1 : 0.8)};
  }
`;

const Mobile = styled.div`
  display: flex;
  min-width: fit-content;
  align-items: center;
  justify-content: center;
  @media (min-width: 880px) {
    display: none;
  }
`;

const Desktop = styled.div`
  display: none;
  min-width: fit-content;
  @media (min-width: 880px) {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
`;

const LogoContainer = styled.img`
  height: 100%;
`;

const Header: React.FC<IProps> = () => {
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const toggleMenu = (state: boolean) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.body.classList.toggle("noscroll", state);
    setMobileMenuOpened(state);
  };
  const navigate = useNavigate();

  const menuItems = [
    { name: "Trade", link: ROUTES.TRADE, outer: false },
    { name: "Faucet", link: ROUTES.FAUCET, outer: false },
    { name: "Docs", link: "https://docs.allspark.gg/", outer: true },
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
    <Root>
      <TopMenu>
        <Row
          alignItems="center"
          crossAxisSize="max"
          justifyContent="space-between"
        >
          <LogoContainer src={theme.images.icons.logo} alt="logo" />
          <Desktop>
            {menuItems.map(({ name, link, outer }) => (
              <MenuItem
                key={name}
                selected={isRoutesEquals(link, location.pathname)}
                onClick={() =>
                  outer ? window.open(link, "_blank") : navigate(link)
                }
              >
                {name}
              </MenuItem>
            ))}
          </Desktop>
          <Desktop>
            <Wallet />
          </Desktop>
        </Row>
        <Mobile>
          <EthBalance />
          <SizedBox width={12} />
          <MobileMenuIcon
            onClick={() => toggleMenu(!mobileMenuOpened)}
            opened={mobileMenuOpened}
          />
        </Mobile>
      </TopMenu>
      <Mobile>
        <MobileMenu
          opened={mobileMenuOpened}
          onClose={() => toggleMenu(false)}
        />
      </Mobile>
    </Root>
  );
};
export default observer(Header);
