import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import { IDialogPropTypes } from "rc-dialog/lib/IDialogPropTypes";

import { ReactComponent as ArrowIcon } from "@src/assets/icons/arrowUp.svg";
import { ReactComponent as FuelWalletIcon } from "@src/assets/wallets/fuel.svg";
import { ReactComponent as MetaMaskIcon } from "@src/assets/wallets/metamask.svg";
import Button from "@src/components/Button";
import { Checkbox } from "@src/components/Checkbox";
import { Dialog } from "@src/components/Dialog";
import Text, { TEXT_TYPES } from "@src/components/Text";
import { useStores } from "@src/stores";
import { LOGIN_TYPE, WALLET_TYPE } from "@stores/AccountStore";

type IProps = Omit<IDialogPropTypes, "onClose"> & {
  onClose: () => void;
};

enum ActiveState {
  SELECT_WALLET,
  USER_AGREEMENT,
}

interface Wallet {
  name: string;
  icon: React.FC;
  type: LOGIN_TYPE;
  isActive: boolean;
}

const WALLETS: Wallet[] = [
  { name: "MetaMask", isActive: true, type: LOGIN_TYPE.METAMASK, icon: MetaMaskIcon },
  { name: "Fuel Wallet", isActive: false, type: LOGIN_TYPE.FUEL_WALLET, icon: FuelWalletIcon },
];

const ConnectWalletDialog: React.FC<IProps> = observer(({ onClose, ...rest }) => {
  const { accountStore, settingsStore } = useStores();
  const theme = useTheme();

  const activeWallets = useMemo(() => WALLETS.filter((w) => w.isActive), []);

  const [activeState, setActiveState] = useState(ActiveState.SELECT_WALLET);

  useEffect(() => {
    if (rest.visible) return;

    setActiveState(ActiveState.SELECT_WALLET);
  }, [rest.visible]);

  const handleWalletClick = () => {
    // todo: Connect works only with metamask
    accountStore.connectWallet(WALLET_TYPE.EVM).then(onClose);
  };

  const handleNextStateClick = () => {
    if (settingsStore.isUserAgreedWithTerms) {
      handleWalletClick();
      return;
    }

    setActiveState(ActiveState.USER_AGREEMENT);
  };

  const renderHeader = () => {
    if (activeState === ActiveState.SELECT_WALLET) {
      return (
        <HeaderContainer>
          <Text color={theme.colors.textPrimary} type={TEXT_TYPES.H}>
            Connect your wallet
          </Text>
          <StyledText color={theme.colors.textSecondary} type={TEXT_TYPES.BUTTON_SECONDARY} onClick={onClose}>
            Close
          </StyledText>
        </HeaderContainer>
      );
    }

    return (
      <HeaderContainer>
        <ArrowContainer>
          <StyledArrowIcon onClick={() => setActiveState(ActiveState.SELECT_WALLET)} />
          <Text color={theme.colors.textPrimary} type={TEXT_TYPES.H}>
            Terms and conditions
          </Text>
        </ArrowContainer>
      </HeaderContainer>
    );
  };

  const renderWallets = () => {
    return (
      <>
        <WalletContainer>
          {activeWallets.map(({ name, icon: WalletIcon }) => (
            <WalletItem key={name} onClick={handleNextStateClick}>
              <WalletIconContainer>
                <WalletIcon />
              </WalletIconContainer>
              <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BUTTON_SECONDARY}>
                {name}
              </Text>
            </WalletItem>
          ))}
        </WalletContainer>
        <FooterContainer>
          <Text type={TEXT_TYPES.BODY}>New to Fuel blockchain?</Text>
          <StyledLink
            href="https://stalkerairdrop.medium.com/fuel-testnet-swaylend-db9ce8d10cb4#f93f"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Text type={TEXT_TYPES.BUTTON_SECONDARY}>Learn more about wallets</Text>
          </StyledLink>
        </FooterContainer>
      </>
    );
  };

  const toggleUserAgreement = () => {
    settingsStore.setIsUserAgreedWithTerms(!settingsStore.isUserAgreedWithTerms);
  };

  const renderAgreement = () => {
    return (
      <>
        <AgreementContainer>{AGREEMENT_TEXT}</AgreementContainer>
        <ButtonContainer>
          <CheckboxContainer>
            <Checkbox checked={settingsStore.isUserAgreedWithTerms} onChange={toggleUserAgreement}>
              <Text type={TEXT_TYPES.BUTTON_SECONDARY} primary>
                I have read, understand and accept these terms
              </Text>
            </Checkbox>
          </CheckboxContainer>
          <Button disabled={!settingsStore.isUserAgreedWithTerms} green onClick={handleWalletClick}>
            Agree and Continue
          </Button>
        </ButtonContainer>
      </>
    );
  };

  const renderContent = () => {
    if (activeState === ActiveState.SELECT_WALLET) {
      return renderWallets();
    }

    return renderAgreement();
  };

  return (
    <Dialog {...rest} title={renderHeader()}>
      <Root>{renderContent()}</Root>
    </Dialog>
  );
});

export default ConnectWalletDialog;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 32px 24px 0 24px;
`;

const Root = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 24px;
`;

const WalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  width: 100%;
  gap: 4px;
`;

const WalletItem = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 24px;
  gap: 4px;
  cursor: pointer;
`;

const WalletIconContainer = styled.div`
  display: flex;

  svg {
    height: 24px;
    width: 24px;
  }
`;

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledLink = styled.a`
  cursor: pointer;
  transition: 0.4s;
  text-decoration: none;

  :hover {
    opacity: 0.8;
  }
`;

const StyledText = styled(Text)`
  cursor: pointer;
  transition: 0.4s;

  &:hover {
    opacity: 0.8;
  }
`;

const AgreementContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: scroll;
  height: 330px;
  padding: 0 24px;
  margin: 24px 0 16px;
  gap: 14px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 24px;
  width: 100%;
`;

const ArrowContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledArrowIcon = styled(ArrowIcon)`
  transform: rotate(90deg);
`;

const AGREEMENT_TEXT = (
  <>
    <Text type={TEXT_TYPES.BODY} secondary>
      This website-hosted user interface (this &quot;Interface&quot;) is an open source frontend software portal to the
      Spark protocol, a decentralized and community-driven collection of blockchain-enabled smart contracts and tools
      (the &quot;Spark Protocol&quot;). This Interface and the Spark Protocol are made available by the Spark Holding
      Foundation, however all transactions conducted on the protocol are run by related permissionless smart contracts.
      As the Interface is open-sourced and the Spark Protocol and its related smart contracts are accessible by any
      user, entity or third party, there are a number of third party web and mobile user-interfaces that allow for
      interaction with the Spark Protocol.
    </Text>
    <Text type={TEXT_TYPES.BODY} secondary>
      THIS INTERFACE AND THE SPARK PROTOCOL ARE PROVIDED &quot;AS IS&quot;, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF
      ANY KIND. The Spark Holding Foundation does not provide, own, or control the Spark Protocol or any transactions
      conducted on the protocol or via related smart contracts. By using or accessing this Interface or the Spark
      Protocol and related smart contracts, you agree that no developer or entity involved in creating, deploying or
      maintaining this Interface or the Spark Protocol will be liable for any claims or damages whatsoever associated
      with your use, inability to use, or your interaction with other users of, this Interface or the Spark Protocol,
      including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of
      profits, digital assets, tokens, or anything else of value.
    </Text>
    <Text type={TEXT_TYPES.BODY} secondary>
      The Spark Protocol is not available to residents of Belarus, the Central African Republic, The Democratic Republic
      of Congo, the Democratic People&apos;s Republic of Korea, the Crimea, Donetsk People&apos;s Republic, and Luhansk
      People&apos;s Republic regions of Ukraine, Cuba, Iran, Libya, Somalia, Sudan, South Sudan, Syria, the USA, Yemen,
      Zimbabwe and any other jurisdiction in which accessing or using the Spark Protocol is prohibited (the
      &quot;Prohibited Jurisdictions&quot;).
    </Text>
    <Text type={TEXT_TYPES.BODY} secondary>
      By using or accessing this Interface, the Spark Protocol, or related smart contracts, you represent that you are
      not located in, incorporated or established in, or a citizen or resident of the Prohibited Jurisdictions. You also
      represent that you are not subject to sanctions or otherwise designated on any list of prohibited or restricted
      parties or excluded or denied persons, including but not limited to the lists maintained by the United
      States&apos; Department of Treasury&apos;s Office of Foreign Assets Control, the United Nations Security Council,
      the European Union or its Member States, or any other government authority.
    </Text>
  </>
);
