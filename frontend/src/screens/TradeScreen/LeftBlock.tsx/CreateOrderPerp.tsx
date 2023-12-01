import styled from "@emotion/styled";
import { Column, Row } from "@components/Flex";
import React, { ComponentProps, useState } from "react";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import TokenInput from "@components/TokenInput";
import Button, { ButtonGroup } from "@components/Button";
import Select from "@components/Select";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { useStores } from "@stores";
import AccordionItem from "@components/AccordionItem";
import BN from "@src/utils/BN";
import { Accordion } from "@szhsin/react-accordion";
import { usePerpTradeVM } from "@screens/TradeScreen/PerpTradeVm";
import Slider from "@components/Slider";

interface IProps extends ComponentProps<any> {}

const Root = styled.div`
	padding: 12px;
`;
const Chip = styled.div`
	padding: 8px 10px;
	color: ${({ theme }) => theme.colors.textSecondary};
	${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
	border-radius: 4px;
	border: 1px solid ${({ theme }) => theme.colors.borderSecondary};
	background: ${({ theme }) => theme.colors.bgPrimary};
	box-sizing: border-box;
	margin-left: 8px;
	cursor: pointer;
`;

const MaxButton = styled(Button)`
	padding: 0 8px !important;
	height: 18px !important;
	border-color: ${({ theme }) => theme.colors.borderSecondary};
	background: ${({ theme }) => theme.colors.bgPrimary};
	border-radius: 4px;
	${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]};
`;

const orderTypes = [
	{ title: "Stop Market", key: "stopmarket", disabled: true },
	{ title: "Market", key: "market", disabled: true },
	{ title: "Limit", key: "limit" },
	{ title: "Stop Limit", key: "stoplimit", disabled: true },
	{ title: "Take Profit", key: "takeprofit", disabled: true },
	{ title: "Take Profit Limit", key: "takeprofitlimit", disabled: true },
];

const CreateOrderPerp: React.FC<IProps> = observer(({ ...rest }) => {
	const { accountStore, tradeStore } = useStores();
	const vm = usePerpTradeVM();
	const [short, setShort] = useState(false);
	const [leverage, setLeverage] = useState(0);

	const orderDetails = [
		{ title: "Max buy", value: "0.00" },
		{ title: "Est. fee", value: "0.00" },
		{ title: "Total amount", value: "0.00" },
	];

	return (
		<Root {...rest}>
			<ButtonGroup>
				<Button active={!short} onClick={() => setShort(false)}>
					LONG
				</Button>
				<Button active={short} onClick={() => setShort(true)}>
					SHORT
				</Button>
			</ButtonGroup>
			<SizedBox height={16} />
			<Row>
				<Column crossAxisSize="max">
					<Select label="Order type" options={orderTypes} selected={orderTypes[1].key} onSelect={() => null} />
					<SizedBox height={2} />
				</Column>
				<SizedBox width={8} />
				<TokenInput
					decimals={vm.token1.decimals}
					amount={short ? vm.shortPrice : vm.longPrice}
					setAmount={(v) => (short ? vm.setShortPrice(v, true) : vm.setLongPrice(v, true))}
					label="Market price"
				/>
			</Row>
			<SizedBox height={2} />
			<Row alignItems="flex-end">
				<TokenInput
					assetId={vm.token0.assetId}
					decimals={vm.token0.decimals}
					amount={short ? vm.shortAmount : vm.longAmount}
					setAmount={(v) => (short ? vm.setShortAmount(v, true) : vm.setLongAmount(v, true))}
					label="Order size"
				/>
				<SizedBox width={8} />
				<Column crossAxisSize="max" alignItems="flex-end">
					<MaxButton fitContent>MAX</MaxButton>
					<SizedBox height={4} />
					<TokenInput
						assetId={vm.token1.assetId}
						decimals={vm.token1.decimals}
						amount={short ? vm.shortTotal : vm.longTotal}
						setAmount={(v) => (short ? vm.setShortTotal(v, true) : vm.setLongTotal(v, true))}
					/>
				</Column>
			</Row>
			<SizedBox height={4} />
			<Row alignItems="center" justifyContent="space-between">
				<Text type={TEXT_TYPES.SUPPORTING}>Available</Text>
				<Row alignItems="center" mainAxisSize="fit-content">
					<Text primary type={TEXT_TYPES.BODY}>
						{accountStore.findBalanceByAssetId(short ? vm.assetId0 : vm.assetId1)?.formatBalance ?? "-"}
					</Text>
					<Text type={TEXT_TYPES.SUPPORTING}>&nbsp;{short ? vm.token0.symbol : vm.token1.symbol}</Text>
				</Row>
			</Row>
			<SizedBox height={8} />
			<Accordion transition transitionTimeout={400}>
				<AccordionItem
					defaultChecked
					header={
						<Row justifyContent="space-between" mainAxisSize="stretch" alignItems="center">
							<Text nowrap primary type={TEXT_TYPES.BUTTON_SECONDARY}>
								Leverage
							</Text>
							<Row justifyContent="flex-end" alignItems="center">
								<Text primary>{BN.formatUnits(short ? vm.shortAmount : vm.longAmount, vm.token0.decimals).toFormat(2)}x</Text>
							</Row>
						</Row>
					}
					initialEntered
				>
					<Slider
						min={0}
						max={100}
						value={leverage}
						percent={leverage}
						onChange={(v) => setLeverage(v as number)}
						step={1}
					/>
					<SizedBox height={8} />
					<Row>
						<TokenInput
							decimals={vm.token1.decimals}
							amount={short ? vm.shortPrice : vm.longPrice}
							setAmount={(v) => (short ? vm.setShortPrice(v, true) : vm.setLongPrice(v, true))}
						/>
						{[5, 10, 20].map((v) => (
							<Chip>{v}x</Chip>
						))}
					</Row>
				</AccordionItem>
			</Accordion>
			<Accordion transition transitionTimeout={400}>
				<AccordionItem
					style={{ borderTop: "none" }}
					defaultChecked
					header={
						<Row justifyContent="space-between" mainAxisSize="stretch" alignItems="center">
							<Text nowrap primary type={TEXT_TYPES.BUTTON_SECONDARY}>
								Order Details
							</Text>
							<Row justifyContent="flex-end" alignItems="center">
								<Text primary>{BN.formatUnits(short ? vm.shortAmount : vm.longAmount, vm.token0.decimals).toFormat(2)}</Text>
								<Text>&nbsp;{vm.token0.symbol}</Text>
							</Row>
						</Row>
					}
					initialEntered
				>
					{orderDetails.map(({ title, value }) => (
						<>
							<Row alignItems="center" justifyContent="space-between">
								<Text nowrap>{title}</Text>
								<Row justifyContent="flex-end" alignItems="center">
									<Text primary>{value}</Text>
								</Row>
							</Row>
							<SizedBox height={8} />
						</>
					))}
				</AccordionItem>
			</Accordion>
			<SizedBox height={16} />
			<Button
				green={!short}
				red={short}
				disabled={vm.loading ? true : short ? !vm.canSell : !vm.canShort}
				onClick={() => vm.createOrder(short ? "short" : "long")}
			>
				{vm.loading ? "Loading..." : short ? `Short ${vm.token0.symbol}` : `Long ${vm.token0.symbol}`}
			</Button>
			<SizedBox height={16} />
			<Button green={!short} red={short} onClick={() => tradeStore.deposit(new BN(5000))}>
				Deposit USDC
			</Button>
			<SizedBox height={16} />
			<Button onClick={() => tradeStore.openOrder()}>Open order</Button>
		</Root>
	);
});
export default CreateOrderPerp;
