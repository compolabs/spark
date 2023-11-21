import styled from "@emotion/styled";
import { Column, Row } from "@components/Flex";
import React, { ComponentProps, useEffect, useState } from "react";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
import TokenInput from "@components/TokenInput";
import Button, { ButtonGroup } from "@components/Button";
import Select from "@components/Select";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { useStores } from "@stores";
import AccordionItem from "@components/AccordionItem";
import BN from "@src/utils/BN";
import Slider from "@components/Slider";
import { Accordion } from "@szhsin/react-accordion";
import MarketSelection from "@screens/TradeScreen/OrderbookAndTradesInterface/LeftBlock.tsx/MarketSelection";
import CreateOrderInterface from "@screens/TradeScreen/OrderbookAndTradesInterface/LeftBlock.tsx/CreateOrderInterface";

interface IProps extends ComponentProps<any> {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	padding: 12px;
	flex: 2;
	max-width: 280px;
	height: 100%;
	border-radius: 10px;
	background: ${({ theme }) => theme.colors.bgSecondary};
`;

const MaxButton = styled(Button)`
	padding: 0 8px !important;
	height: 18px !important;
	border-color: ${({ theme }) => theme.colors.borderSecondary};
	background: ${({ theme }) => theme.colors.bgPrimary};
	border-radius: 4px;
	${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]};
`;

const StyledInfoIcon = styled(InfoIcon)`
	margin-right: 2px;

	path {
		fill: ${({ theme }) => theme.colors.textDisabled};
	}
`;

const LeftBlock: React.FC<IProps> = observer(({ ...rest }) => {
	const { settingsStore } = useStores();

	return <Root {...rest}>{settingsStore.marketSelectionOpened ? <MarketSelection /> : <CreateOrderInterface />}</Root>;
});
export default LeftBlock;
