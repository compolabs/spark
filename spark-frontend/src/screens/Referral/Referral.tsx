import styled from "@emotion/styled";
import React from "react";
import { Column, Row } from "@src/components/Flex";
import Text from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
// import bg from "@src/assets/referralBackground.svg";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background: ${({ theme }) => theme.colors.gray4};
	z-index: 10;
	padding: 16px;
	width: 100%;
	box-sizing: border-box;
	@media (min-width: 480px) {
		padding: 16px 0;
	}
	@media (min-width: 1280px) {
		padding: 40px 0;
	}
	height: 100vh;
`;
const Pic = styled.div`
	background: url(${bg}) center no-repeat #eeeeee;
	background-size: cover;
	min-width: 640px;
	height: 100vh;
	display: none;
	margin-top: -80px;
	z-index: 1;
	@media (min-width: 1280px) {
		display: flex;
	}
`;

const Layout = styled.div`
	display: flex;
	flex: 1;

	flex-direction: column;
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	z-index: 10000;
	background-color: ${({ theme }) => theme.colors.white};
	@media (min-width: 1280px) {
		justify-content: center;
	}
`;

const Container = styled(Column)`
	width: 100%;
`;
const Referral: React.FC<IProps> = () => {

	return (
		<Layout>
			<Row alignItems="center">
				<Pic />
				<Root>
					<Column justifyContent="center" alignItems="center" crossAxisSize="max" style={{ maxWidth: 360 }}>
						<Text>Connect wallet</Text>
						<SizedBox height={40} />
						<Container>todo</Container>
					</Column>
					<SizedBox height={8} />
					<Text>
						<span> New to Waves blockchain?</span> <br />
						<Text>Learn more about wallets</Text>
					</Text>
					<SizedBox height={116} />
				</Root>
			</Row>
		</Layout>
	);
};
export default observer(Referral);
