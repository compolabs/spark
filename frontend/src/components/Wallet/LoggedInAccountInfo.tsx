import styled from "@emotion/styled";
import React, { useState } from "react";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import { useStores } from "@stores";
import Tooltip from "@components/Tooltip";
import { observer } from "mobx-react-lite";
import WalletActionsTooltip from "./WalletActionsTooltip";
import centerEllipsis from "@src/utils/centerEllipsis";
import * as identityImg from "identity-img";
import { useTheme } from "@emotion/react";
import EthBalance from "@components/Wallet/EthBalance";

interface IProps {}

const Root = styled(Row)`
  align-items: center;
  height: fit-content;
  justify-content: space-between;
  @media (min-width: 880px) {
    justify-content: flex-end;
  }

  .balances {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
`;

const AddressContainer = styled.div<{ expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colors.grey100};
  box-sizing: border-box;
  padding: 0 16px;
  border-radius: 4px;
  height: 40px;
  margin-left: 24px;
  font-family: "Roboto", sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.white100};

  .avatar {
    transition: 0.4s;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 8px;
  }

  .menu-arrow {
    transition: 0.4s;
    transform: ${({ expanded }) =>
      expanded ? "rotate(-90deg)" : "rotate(0deg)"};
  }
`;

const LoggedInAccountInfo: React.FC<IProps> = () => {
  const { accountStore } = useStores();
  const { ethFormatWallet } = accountStore;
  const avatar =
    ethFormatWallet && identityImg.create(ethFormatWallet, { size: 24 * 3 });
  const theme = useTheme();
  const [accountOpened, setAccountOpened] = useState<boolean>(false);
  return (
    <Root>
      <Row justifyContent="space-between" alignItems="center">
        <EthBalance />
        <Tooltip
          config={{
            placement: "bottom-end",
            trigger: "click",
            onVisibleChange: setAccountOpened,
          }}
          content={<WalletActionsTooltip />}
        >
          <AddressContainer expanded={accountOpened}>
            <img className="avatar" src={avatar!} alt="avatar" />
            {centerEllipsis(ethFormatWallet ?? "", 8)}
            <SizedBox width={4} />
            <img
              src={theme.images.icons.arrowDown}
              className="menu-arrow"
              alt="arrow"
            />
          </AddressContainer>
        </Tooltip>
      </Row>
    </Root>
  );
};
export default observer(LoggedInAccountInfo);
