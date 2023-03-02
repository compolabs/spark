import styled from "@emotion/styled";
import React, { useState } from "react";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { useStores } from "@stores";
import Tooltip from "@components/Tooltip";
import { observer } from "mobx-react-lite";
import WalletActionsTooltip from "./WalletActionsTooltip";
import centerEllipsis from "@src/utils/centerEllipsis";
import TokenIcon from "@components/TokenIcon";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import { useTheme } from "@emotion/react";
import BN from "@src/utils/BN";

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
const Container = styled(Row)`
  border: 2px solid
    ${({ theme }) => theme.colors.header.walletAddressBackground};
  border-radius: 4px;
`;
const BalanceContainer = styled(Row)`
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.mainBackground};
  padding: 10px 16px;
  border-radius: 4px;
`;
const AddressContainer = styled.div<{ expanded: boolean }>`
  display: flex;
  border-radius: 4px 0 0 4px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.header.walletAddressBackground};

  :hover {
    // background: ${({ theme }) => theme.colors.neutral1};
  }

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
  const { address } = accountStore;
  const theme = useTheme();
  const eth = TOKENS_BY_SYMBOL.ETH;
  const balance = accountStore.findBalanceByAssetId(eth.assetId);
  const formattedBalance = BN.formatUnits(
    balance?.balance ?? BN.ZERO,
    eth?.decimals
  );
  const [accountOpened, setAccountOpened] = useState<boolean>(false);
  return (
    <Root>
      <SizedBox width={4} />
      <Container justifyContent="center" alignItems="center">
        <BalanceContainer>
          <TokenIcon size="tiny" src={eth.logo} alt="token" />
          <SizedBox width={4} />
          <Text size="small">{formattedBalance.toFormat(4)}</Text>
        </BalanceContainer>
        <Tooltip
          config={{
            placement: "bottom-end",
            trigger: "click",
            onVisibleChange: setAccountOpened,
          }}
          content={<WalletActionsTooltip />}
        >
          <AddressContainer expanded={accountOpened}>
            <Text size="small">{centerEllipsis(address ?? "", 10)}</Text>
            <SizedBox width={4} />
            <img
              src={theme.images.icons.arrowDown}
              className="menu-arrow"
              alt="arrow"
            />
          </AddressContainer>
        </Tooltip>
      </Container>
    </Root>
  );
};
export default observer(LoggedInAccountInfo);
