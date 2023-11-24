import styled from "@emotion/styled";
import { Column, Row } from "@components/Flex";
import React, { ComponentProps } from "react";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import TokenInput from "@components/TokenInput";
import Button, { ButtonGroup } from "@components/Button";
import Select from "@components/Select";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { useStores } from "@stores";
import AccordionItem from "@components/AccordionItem";
import BN from "@src/utils/BN";
import { Accordion } from "@szhsin/react-accordion";
import { usePerpTradeVM } from "@screens/TradeScreen/PerpTradeVm";

interface IProps extends ComponentProps<any> {}

const Root = styled.div`
	padding: 12px;
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

const orderTypes = [
	{ title: "Market", key: "market", disabled: true },
	{ title: "Stop Market", key: "stopmarket", disabled: true },
	{ title: "Limit", key: "limit" },
	{ title: "Stop Limit", key: "stoplimit", disabled: true },
	{ title: "Take Profit", key: "takeprofit", disabled: true },
	{ title: "Take Profit Limit", key: "takeprofitlimit", disabled: true },
];

const CreateOrderPerp: React.FC<IProps> = observer(({ ...rest }) => {
	const { accountStore } = useStores();
	const vm = usePerpTradeVM();

	return (
		<Root {...rest}>
			<ButtonGroup>
				<Button active={!vm.isShort} onClick={() => vm.setIsShort(false)}>
					LONG
				</Button>
				<Button active={vm.isShort} onClick={() => vm.setIsShort(true)}>
					SHORT
				</Button>
			</ButtonGroup>
			<SizedBox height={16} />
			<Row>
				<Column crossAxisSize="max">
					<Select label="Order type" options={orderTypes} selected={orderTypes[1].key} onSelect={() => null} />
					<SizedBox height={2} />
					<Row alignItems="center">
						<StyledInfoIcon />
						<Text disabled type={TEXT_TYPES.SUPPORTING}>
							About order type
						</Text>
					</Row>
				</Column>
				<SizedBox width={8} />
				<TokenInput
					decimals={vm.token1.decimals}
					amount={vm.isShort ? vm.shortPrice : vm.longPrice}
					setAmount={(v) => (vm.isShort ? vm.setShortPrice(v, true) : vm.setLongPrice(v, true))}
					label="Market price"
				/>
			</Row>
			<SizedBox height={2} />
			<Row alignItems="flex-end">
				<TokenInput
					assetId={vm.token0.assetId}
					decimals={vm.token0.decimals}
					amount={vm.isShort ? vm.shortAmount : vm.longAmount}
					setAmount={(v) => (vm.isShort ? vm.setShortAmount(v, true) : vm.setLongAmount(v, true))}
					// error={vm.isShort ? vm.shortAmountError : undefined}
					// errorMessage="Insufficient amount"
					label="Order size"
				/>
				<SizedBox width={8} />
				<Column crossAxisSize="max" alignItems="flex-end">
					<MaxButton fitContent>MAX</MaxButton>
					<SizedBox height={4} />
					<TokenInput
						assetId={vm.token1.assetId}
						decimals={vm.token1.decimals}
						amount={vm.isShort ? vm.shortTotal : vm.longTotal}
						setAmount={(v) => (vm.isShort ? vm.setShortTotal(v, true) : vm.setLongTotal(v, true))}
						// errorMessage="Insufficient amount"
						// error={vm.isShort ? undefined : vm.longTotalError}
					/>
				</Column>
			</Row>
			<SizedBox height={4} />
			<Row alignItems="center" justifyContent="space-between">
				<Text type={TEXT_TYPES.SUPPORTING}>Available</Text>
				<Row alignItems="center" mainAxisSize="fit-content">
					<Text primary type={TEXT_TYPES.BODY}>
						{accountStore.findBalanceByAssetId(vm.isShort ? vm.assetId0 : vm.assetId1)?.formatBalance ?? "-"}
					</Text>
					<Text type={TEXT_TYPES.SUPPORTING}>&nbsp;{vm.isShort ? vm.token0.symbol : vm.token1.symbol}</Text>
				</Row>
			</Row>
			{/*<Button onClick={vm.setupMarketMakingAlgorithm}>Setup market making algorithm</Button>*/}
			<SizedBox height={28} />
			{/*<Slider min={0} max={100} value={percent} percent={percent} onChange={(v) => setPercent(v as number)} step={1} />*/}
			<SizedBox height={28} />
			<Accordion transition transitionTimeout={400}>
				<AccordionItem
					defaultChecked
					header={
						<Row justifyContent="space-between" mainAxisSize="stretch" alignItems="center">
							<Text nowrap primary type={TEXT_TYPES.BUTTON_SECONDARY}>
								Order Details
							</Text>
							<Row justifyContent="flex-end" alignItems="center">
								<Text primary>
									{BN.formatUnits(vm.isShort ? vm.shortAmount : vm.longAmount, vm.token0.decimals).toFormat(2)}
								</Text>
								<Text>&nbsp;{vm.token0.symbol}</Text>
							</Row>
						</Row>
					}
					initialEntered
				>
					<Row alignItems="center" justifyContent="space-between">
						<Text nowrap>Max long</Text>
						<Row justifyContent="flex-end" alignItems="center">
							<Text primary>{BN.formatUnits(vm.isShort ? vm.shortTotal : vm.longTotal, vm.token1.decimals).toFormat(2)}</Text>
							<Text>&nbsp;{vm.token1.symbol}</Text>
						</Row>
					</Row>
					<SizedBox height={8} />
					<Row alignItems="center" justifyContent="space-between">
						<Text nowrap>Matcher Fee</Text>
						<Row justifyContent="flex-end" alignItems="center">
							<Text primary>0.000001</Text>
							<Text>&nbsp;ETH</Text>
						</Row>
					</Row>
					<SizedBox height={8} />
					<Row alignItems="center" justifyContent="space-between">
						<Text nowrap>Total amount</Text>
						<Row justifyContent="flex-end" alignItems="center">
							<Text primary>
								{BN.formatUnits(vm.isShort ? vm.shortAmount : vm.shortAmount, vm.token0.decimals).toFormat(2)}
							</Text>
							<Text>&nbsp;{vm.token0.symbol}</Text>
						</Row>
					</Row>
				</AccordionItem>
			</Accordion>
			<SizedBox height={16} />
			<Button
				green={!vm.isShort}
				red={vm.isShort}
				disabled={vm.loading ? true : vm.isShort ? !vm.canSell : !vm.canShort}
				onClick={() => vm.createOrder(vm.isShort ? "short" : "long")}
			>
				{vm.loading ? "Loading..." : vm.isShort ? `Sell ${vm.token0.symbol}` : `Buy ${vm.token0.symbol}`}
			</Button>
		</Root>
	);
});
export default CreateOrderPerp;
