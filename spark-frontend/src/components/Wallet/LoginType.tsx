import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Text from "@components/Text";
// import SizedBox from "@components/SizedBox";
import { useTheme } from "@emotion/react";

interface IProps extends HTMLAttributes<HTMLDivElement> {
	title: string;
	icon?: string;
}

const Root = styled.div<{ disable?: boolean }>`
	display: flex;
	flex-direction: row;
	//width: 100%;
	justify-content: space-between;
	padding: 10px 0;
	border-bottom: 1px solid ${({ theme }) => theme.colors.gray1};
	box-sizing: border-box;
	cursor: ${({ disable }) => (disable ? "not-allowed" : "pointer")};
`;
// const Icon = styled.img`
//   width: 24px;
//   height: 24px;
//   display: flex;
//   flex-direction: column;
// `;

const LoginType: React.FC<IProps> = ({ title, icon, onClick, ...rest }) => {
	const theme = useTheme();
	return (
		<Root {...rest} disable={onClick == null} onClick={onClick}>
			{/*<Icon src={icon} alt={type} />*/}
			{/*<SizedBox width={4} />*/}
			<Text>{title}</Text>
		</Root>
	);
};
export default LoginType;
