import React, { useState } from "react";
import styled from "@emotion/styled";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react";

import Button from "@components/Button";
import Divider from "@components/Divider";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import Tooltip from "@components/Tooltip";
import arrowIcon from "@src/assets/icons/arrowUp.svg";
import copyIcon from "@src/assets/icons/copy.svg";
import link from "@src/assets/icons/link.svg";
import logout from "@src/assets/icons/logout.svg";
import userIcon from "@src/assets/icons/user.svg";
import { EXPLORER_URL, TOKENS_BY_SYMBOL } from "@src/constants";
import BN from "@src/utils/BN";
import centerEllipsis from "@src/utils/centerEllipsis";
import { useStores } from "@stores";

interface IProps {}

const Root = styled(Button)<{
	focused?: boolean;
}>`
	background: transparent;
	padding: 0 8px;
	color: ${({ theme }) => theme.colors.textPrimary};
	${TEXT_TYPES_MAP[TEXT_TYPES.BODY]};

	:hover {
		background: transparent;
	}

	.menu-arrow {
		transition: 0.4s;
		transform: ${({ focused }) => (focused ? "rotate(-180deg)" : "rotate(0deg)")};
	}

	:hover {
		.menu-arrow {
			transform: ${({ focused }) => (focused ? "rotate(-180)" : "rotate(-90deg)")};
		}
	}
`;
const Icon = styled.img`
	width: 24px;
	height: 24px;
`;
const ActionRow = styled(Row)`
	padding: 8px 16px;
	//justify-content: center;
	align-items: center;
`;
const ConnectedWallet: React.FC<IProps> = observer(() => {
	const { accountStore, notificationStore } = useStores();
	const [focused, setFocused] = useState(false);
	const ethBalance = BN.formatUnits(
		accountStore.getBalance(TOKENS_BY_SYMBOL.ETH.assetId) ?? 0,
		TOKENS_BY_SYMBOL.ETH.decimals,
	)?.toFormat(4);
	const handleCopy = (object: string) => {
		object === "address"
			? accountStore.address && copy(accountStore.address)
			: accountStore.mnemonic && copy(accountStore.mnemonic);
		notificationStore.toast(`Your ${object} was copied`, { type: "info" });
	};
	const actions = [
		{
			icon: copyIcon,
			action: () => handleCopy("address"),
			title: "Copy address",
			active: true,
		},
		{
			icon: copyIcon,
			action: () => handleCopy("seed"),
			title: "Copy seed",
			active: !!accountStore.mnemonic,
		},
		{
			icon: link,
			// https://sepolia.arbiscan.io/address/0x8538B9F22FE51bD16Fa6Eab6a840FA8bf12dd227
			action: () => window.open(`${EXPLORER_URL}/address/${accountStore.address}`),
			title: "View in Explorer",
			active: true,
		},
		{
			icon: logout,
			action: () => accountStore.disconnect(),
			title: "Disconnect",
			active: true,
		},
	];
	return (
		<Tooltip
			config={{
				placement: "bottom-start",
				trigger: "click",
				onVisibleChange: setFocused,
			}}
			content={
				//todo нет ховера у элементов меню
				<Column crossAxisSize="max">
					<ActionRow>
						<Icon alt="ETH" src={TOKENS_BY_SYMBOL.ETH.logo} />
						<SizedBox width={8} />
						<Text type={TEXT_TYPES.BUTTON_SECONDARY}>{`${ethBalance} ETH`}</Text>
					</ActionRow>
					<Divider />
					{actions.map(
						({ title, action, active, icon }) =>
							active && (
								<ActionRow key={title} onClick={action}>
									<Icon alt="ETH" src={icon} />
									<SizedBox width={8} />
									<Text type={TEXT_TYPES.BUTTON_SECONDARY}>{title}</Text>
								</ActionRow>
							),
					)}
				</Column>
			}
		>
			<Root focused={focused}>
				<img alt="user" src={userIcon} />
				{/*<img src={healthIcon} alt="health" />*/}
				<SizedBox width={8} />
				{centerEllipsis(accountStore.address ?? "", 10)}
				<SizedBox width={8} />
				<img alt="arrow" className="menu-arrow" src={arrowIcon} />
			</Root>
		</Tooltip>
	);
});
export default ConnectedWallet;
