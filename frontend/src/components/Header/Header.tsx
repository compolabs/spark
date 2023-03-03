import styled from "@emotion/styled";
import React, { useState } from "react";
import { Column, Row } from "@components/Flex";
import MobileMenu from "@components/Header/MobileMenu";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import { useLocation, useNavigate } from "react-router-dom";
import isRoutesEquals from "@src/utils/isRoutesEquals";
import Wallet from "../Wallet";
import { ROUTES } from "@src/constants";
import { useTheme } from "@emotion/react";
import Text from "@components/Text";
import MobileMenuIcon from "../MobileMenuIcon";

interface IProps {}

const Root = styled(Column)`
  width: 100%;
  background: ${({ theme }) => theme.colors.mainBackground};
  align-items: center;
  z-index: 102;
`;

const TopMenu = styled.header`
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 16px;
  max-width: 1440px;
  z-index: 102;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.mainBackground};

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
const MenuItem = styled.div<{ selected?: boolean }>`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  margin: 0 4px;
  border-radius: 4px;

  div {
    color: ${({ selected, theme }) =>
      selected ? "#3C69FF" : theme.colors.header.navLinkBackground};
  })

`;

const Mobile = styled.div`
  display: flex;
  min-width: fit-content;
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
    {
      name: "Docs",
      link: "https://google.com/",
      outer: true,
    },
    {
      name: "Github",
      link: "https://github.com/sway-gang/sway-exchange",
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
        <Row alignItems="center" crossAxisSize="max">
          <img className="logo" src={theme.images.icons.logo} alt="logo" />
          <Desktop>
            <SizedBox width={40} />
            {menuItems.map(({ name, link, outer }) => (
              <MenuItem
                key={name}
                selected={isRoutesEquals(link, location.pathname)}
                onClick={() =>
                  outer ? window.open(link, "_self") : navigate(link)
                }
              >
                <Text
                  size="small"
                  weight={500}
                  style={{
                    color: isRoutesEquals(link, location.pathname)
                      ? "#3C69FF"
                      : "white",
                  }}
                >
                  {name}
                </Text>
              </MenuItem>
            ))}
          </Desktop>
        </Row>
        <Mobile>
          <MobileMenuIcon
            onClick={() => toggleMenu(!mobileMenuOpened)}
            opened={mobileMenuOpened}
          />
        </Mobile>
        <Desktop>
          <Wallet />
        </Desktop>
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
