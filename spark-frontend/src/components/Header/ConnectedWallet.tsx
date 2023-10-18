import styled from "@emotion/styled";
import React, { useState } from "react";
import { observer } from "mobx-react";
import Tooltip from "@components/Tooltip";
import { Column } from "@components/Flex";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import SizedBox from "@components/SizedBox";
import arrowIcon from "@src/assets/icons/arrowUp.svg";
import Button from "@components/Button";
import { useStores } from "@stores";
import centerEllipsis from "@src/utils/centerEllipsis";
import healthIcon from "@src/assets/icons/health.svg";
import { Option } from "@components/Select";
import { EXPLORER_URL } from "@src/constants";
import copy from "copy-to-clipboard";

interface IProps {}

const Root = styled(Button)<{ focused?: boolean }>`
	background: transparent;
	border: 1px solid ${({ theme }) => theme.colors.white};
	padding: 0;

	${TEXT_TYPES_MAP[TEXT_TYPES.H2]}
	:hover {
		background: transparent;
		border: 1px solid ${({ theme }) => theme.colors.white};
		${TEXT_TYPES_MAP[TEXT_TYPES.H2]}
	}

	.menu-arrow {
		transition: 0.4s;
		transform: ${({ focused }) => (focused ? "rotate(0deg)" : "rotate(180deg)")};
	}

	:hover {
		.menu-arrow {
			transform: ${({ focused }) => (focused ? "rotate(0)" : "rotate(90deg)")};
		}
	}
`;

const ConnectedWallet: React.FC<IProps> = observer(() => {
	const { accountStore, notificationStore } = useStores();
	const [focused, setFocused] = useState(false);
	const handleCopyAddress = () => {
		accountStore.address && copy(accountStore.address);
		notificationStore.toast("Your address was copied", { type: "info" });
	};
	return (
		<Tooltip
			config={{
				placement: "bottom-start",
				trigger: "click",
				onVisibleChange: setFocused,
			}}
			content={
				<Column crossAxisSize="max">
					<Option onClick={handleCopyAddress}>Copy address</Option>
					<Option onClick={() => window.open(`${EXPLORER_URL}/address/${accountStore.address}`)}> View in Explorer</Option>
					<Option disabled>Export log file</Option>
					<Option onClick={accountStore.disconnect}>Disconnect</Option>
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
