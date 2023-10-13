import styled from "@emotion/styled";
import React from "react";
import { Column } from "@components/Flex";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled(Column)`
	padding: 16px;

	.menu-item {
		padding: 12px 20px;
		cursor: pointer;

		:hover {
			background: ${({ theme }) => theme.colors.gray5};
			border-radius: 4px;
		}
	}
`;

const WalletActionsTooltip: React.FC<IProps> = () => {
	return <Root alignItems="center"></Root>;
};
export default observer(WalletActionsTooltip);
