import styled from "@emotion/styled";
import React from "react";
import { Column } from "@src/components/Flex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import bg from "@src/assets/referralBackground.png";
import { useStores } from "@stores";
import ConnectWalletInterface from "@screens/Referral/ConnectWalletInterface";
import ReferralInterface from "@screens/Referral/ReferralInterface";
import { observer } from "mobx-react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@src/constants";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	height: 100%;
	flex: 1;
	box-sizing: border-box;
	padding: 0 4px;
`;

const Image = styled.div`
	flex: 2;
	background: url(${bg}) center no-repeat;
	background-size: cover;
	display: none;
	border-radius: 4px;
	@media (min-width: 880px) {
		width: 100%;
		height: 100%;
		display: flex;
	}
`;

const Body = styled(Column)`
	align-items: center;
	justify-content: center;
	flex: 3;
	height: 100%;
	background: ${({ theme }) => theme.colors.bgSecondary};
	border-radius: 4px;
`;

export const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.greenLight};
  cursor: pointer;
  transition: .4s;
  text-decoration: none;
  ${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]};

  :hover {
    opacity: .8;
  }

}
`;
const Referral: React.FC<IProps> = observer(() => {
	const { accountStore, referralStore, tradeStore } = useStores();
	if (referralStore.access) return <Navigate to={`/${tradeStore.defaultMarketSymbol}`} />;
	return (
		<Root>
			<Image />
			<SizedBox width={4} />
			<Body>
				<Column justifyContent="center" alignItems="center" crossAxisSize="max" style={{ maxWidth: 360 }}>
					{accountStore.address != null ? <ReferralInterface /> : <ConnectWalletInterface />}
					<SizedBox height={40} />
					<Text>New to Fuel blockchain?</Text>
					<SizedBox height={4} />
					<StyledLink
						rel="noopener noreferrer"
						target="_blank"
						href="https://stalkerairdrop.medium.com/fuel-testnet-swaylend-db9ce8d10cb4#f93f"
					>
						Learn more about wallets
					</StyledLink>
				</Column>
			</Body>
		</Root>
	);
});

export default Referral;
