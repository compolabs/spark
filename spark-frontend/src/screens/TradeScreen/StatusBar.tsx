import styled from "@emotion/styled";
import React, { useEffect } from "react";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import Text, { TEXT_TYPES } from "@components/Text";
import { Row } from "@components/Flex";
import Chip from "@components/Chip";
import { useTheme } from "@emotion/react";
import dayjs from "dayjs";
import axios from "axios";

interface IProps {}

const Root = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	height: 24px;
	box-sizing: border-box;
	//border: 1px solid white;
	padding: 0 16px;
`;

const Indicator = styled.div<{ error?: boolean }>`
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: ${({ theme, error }) => (error ? theme.colors.red : theme.colors.green)};
`;

const Divider = styled.div`
	width: 1px;
	height: 8px;
	background: ${({ theme }) => theme.colors.gray2};
	margin: 0 8px;
`;

const StatusBar: React.FC<IProps> = observer(() => {
	const { accountStore } = useStores();
	const theme = useTheme();
	return (
		<Root>
			<Row alignItems="center" mainAxisSize="fit-content">
				<Indicator error={accountStore.provider == null} />
				<SizedBox width={8} />
				<Text type={TEXT_TYPES.BODY_SMALL}>Stable Connection</Text>
			</Row>
			<Divider />
			<Row alignItems="center" mainAxisSize="fit-content">
				<Indicator />
				<SizedBox width={8} />
				<Text type={TEXT_TYPES.BODY_SMALL}> Response Time Name holder (xxxms)</Text>
			</Row>
			<Divider />
			<Text type={TEXT_TYPES.BODY_SMALL}>XX,XXX TPS</Text>
			<Divider />
			<Text type={TEXT_TYPES.BODY_SMALL}>Average Gas Prices:</Text>
			<SizedBox width={4} />
			<Chip>
				SPOT:&nbsp;
				<div style={{ color: theme.colors.white }}>X,XXXX€</div>
			</Chip>
			<SizedBox width={8} />
			<Chip>
				PERP:&nbsp;
				<div style={{ color: theme.colors.white }}>X,XXXX€</div>
			</Chip>
		</Root>
	);
});
export default StatusBar;
