import styled from "@emotion/styled";
import React, { useState } from "react";
import { observer } from "mobx-react";
import Tooltip from "@components/Tooltip";
import { Column, Row } from "@components/Flex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import SizedBox from "@components/SizedBox";
import arrowIcon from "@src/assets/icons/arrowUp.svg";
import Button from "@components/Button";
import { useStores } from "@stores";
import centerEllipsis from "@src/utils/centerEllipsis";
import healthIcon from "@src/assets/icons/health.svg";
import { EXPLORER_URL, TOKENS_BY_SYMBOL } from "@src/constants";
import copy from "copy-to-clipboard";
import BN from "@src/utils/BN";
import copyIcon from "@src/assets/icons/copy.svg";
import logout from "@src/assets/icons/logout.svg";
import link from "@src/assets/icons/link.svg";
import Divider from "@components/Divider";

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
		accountStore.getBalance(TOKENS_BY_SYMBOL.ETH) ?? 0,
		TOKENS_BY_SYMBOL.ETH.decimals,
	)?.toFormat(4);
	const handleCopy = (object: string) => {
		object === "address"
			? accountStore.address && copy(accountStore.address)
			: accountStore.seed && copy(accountStore.seed);
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
			active: accountStore.seed != null,
		},
		{
			icon: link,
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
				<Column crossAxisSize="max">
					<ActionRow>
						<Icon src={TOKENS_BY_SYMBOL.ETH.logo} alt="ETH" />
						<SizedBox width={8} />
						<Text type={TEXT_TYPES.BUTTON_SECONDARY}>{`${ethBalance} ETH`}</Text>
					</ActionRow>
					<Divider />
					{actions.map(
						({ title, action, active, icon }) =>
							active && (
								<ActionRow onClick={action}>
									<Icon src={icon} alt="ETH" />
									<SizedBox width={8} />
									<Text type={TEXT_TYPES.BUTTON_SECONDARY}>{title}</Text>
								</ActionRow>
							),
					)}
					{/*<ActionRow onClick={() => handleCopy("address")}>*/}
					{/*	<Icon src={TOKENS_BY_SYMBOL.ETH.logo} alt="ETH" />*/}
					{/*	<Option>{ethBalance} ETH</Option>*/}
					{/*</ActionRow>*/}
					{/*<Divider />*/}
					{/*<Option onClick={() => handleCopy("address")}>Copy address</Option>*/}
					{/*<Option onClick={() => window.open(`${EXPLORER_URL}/address/${accountStore.address}`)}> View in Explorer</Option>*/}
					{/*<Option disabled>Export log file</Option>*/}
					{/*{accountStore.seed != null && <Option onClick={() => handleCopy("seed")}>Copy seed</Option>}*/}
					{/*<Option onClick={accountStore.disconnect}>Disconnect</Option>*/}
				</Column>
			}
		>
			<Root focused={focused}>
				<img src={healthIcon} alt="health" />
				<SizedBox width={8} />
				{centerEllipsis(accountStore.address ?? "", 10)}
				<SizedBox width={8} />
				<img src={arrowIcon} className="menu-arrow" alt="arrow" />
			</Root>
		</Tooltip>
	);
});
export default ConnectedWallet;
